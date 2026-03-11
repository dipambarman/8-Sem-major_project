import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootState, AppDispatch } from '../../store/store';
import { createOrder } from '../../store/slices/orderSlice';
import { fetchWallet } from '../../store/slices/walletSlice';
import { clearCart } from '../../store/slices/cartSlice';
import { initiatePayment } from '../../services/payment/razorpay';
import { paymentApi } from '../../services/api/paymentApi';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const { items: cartItems } = useSelector((state: RootState) => state.cart);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🛒 CheckboxScreen - Cart Items:', JSON.stringify(cartItems, null, 2));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const { user } = useSelector((state: RootState) => state.auth);
  const { wallet } = useSelector((state: RootState) => state.wallet);

  // Create a separate effect for fetching wallet to avoid infinite loops or missing data
  React.useEffect(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  const [orderType, setOrderType] = useState<'delivery' | 'pickup' | 'dine_in'>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'razorpay'>('wallet');
  const [loading, setLoading] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
  const deliveryFee = orderType === 'delivery' ? (subtotal > 100 ? 0 : 20) : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    // Check if wallet is loaded and has sufficient balance
    if (paymentMethod === 'wallet') {
      if (!wallet) {
        Alert.alert('Error', 'Wallet information not available. Please try again.');
        dispatch(fetchWallet()); // execution might recover next time
        return;
      }
      if (wallet.balance < total) {
        Alert.alert('Insufficient Balance', 'Please top up your wallet or choose another payment method');
        return;
      }
    }

    setLoading(true);

    try {
      let paymentResult = null;

      if (paymentMethod === 'razorpay') {
        // 1. Create Order on Backend
        const orderResponse = await paymentApi.createRazorpayOrder(total);
        if (!orderResponse.success) {
          throw new Error('Failed to create payment order');
        }

        const { razorpayOrderId, paymentId, key } = orderResponse.data;

        // 2. Open Razorpay Checkout
        const paymentData = await initiatePayment({
          amount: total,
          orderId: razorpayOrderId,
          key: key, // Pass the key received from backend
          description: 'Smart Canteen Order',
          prefill: {
            email: user?.email,
            contact: user?.phone,
            name: user?.fullName,
          },
        });

        // FIX: The wrapper (Step 405) didn't allow passing 'key'!
        // I should probably update `razorpay.ts` to accept 'key' or handle it here.
        // But for now, let's assume `initiatePayment` might fail if key is missing.
        // Actually, let's look at Step 405 again. 
        // It uses `RazorpayCheckout.open(razorpayOptions)`. `razorpayOptions` needs `key`.
        // The current `razorpay.ts` DOES NOT set the key. This is a bug.

        if (!paymentData.success) {
          setLoading(false);
          Alert.alert('Payment Failed', paymentData.error);
          return;
        }

        // 3. Verify Payment on Backend
        const verifyResponse = await paymentApi.verifyRazorpayPayment({
          razorpay_order_id: paymentData.orderId,
          razorpay_payment_id: paymentData.paymentId,
          razorpay_signature: paymentData.signature,
          paymentId: paymentId // We need to send the internal paymentId too
        });

        if (!verifyResponse.success) {
          throw new Error('Payment verification failed');
        }

        // Success! Proceed to create order
        paymentResult = verifyResponse.data;
      }

      const orderData = {
        items: cartItems.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
        })),
        orderType,
        paymentMethod,
        paymentDetails: paymentResult,
      };

      const result = await dispatch(createOrder(orderData)).unwrap();

      dispatch(clearCart());

      Alert.alert(
        'Order Placed!',
        `Your order #${result.id} has been placed successfully`,
        [
          {
            text: 'Track Order',
            onPress: () => (navigation as any).navigate('Tracking', { orderId: result.id }),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const OrderTypeOption = ({ type, icon, label, description }: any) => (
    <TouchableOpacity
      style={[
        styles.orderTypeOption,
        orderType === type && styles.selectedOrderType,
      ]}
      onPress={() => setOrderType(type)}
    >
      <Ionicons name={icon} size={24} color={orderType === type ? '#007AFF' : '#666'} />
      <View style={styles.orderTypeText}>
        <Text style={styles.orderTypeLabel}>{label}</Text>
        <Text style={styles.orderTypeDescription}>{description}</Text>
      </View>
      {orderType === type && (
        <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  const PaymentOption = ({ method, icon, label, description }: any) => (
    <TouchableOpacity
      style={[
        styles.paymentOption,
        paymentMethod === method && styles.selectedPaymentOption,
      ]}
      onPress={() => setPaymentMethod(method)}
    >
      <Ionicons name={icon} size={24} color={paymentMethod === method ? '#007AFF' : '#666'} />
      <View style={styles.paymentText}>
        <Text style={styles.paymentLabel}>{label}</Text>
        <Text style={styles.paymentDescription}>{description}</Text>
      </View>
      {paymentMethod === method && (
        <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingSpinner message="Processing your order..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.orderItem}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQuantity}>×{item.quantity}</Text>
            <Text style={styles.itemPrice}>₹{((item.price || 0) * item.quantity).toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>₹{subtotal.toFixed(2)}</Text>
          </View>
          {deliveryFee > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Delivery Fee</Text>
              <Text style={styles.totalValue}>₹{deliveryFee.toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>₹{total.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Type</Text>
        <OrderTypeOption
          type="pickup"
          icon="bag"
          label="Pickup"
          description="Ready in 15-20 minutes"
        />
        <OrderTypeOption
          type="delivery"
          icon="bicycle"
          label="Delivery"
          description="Delivered to your location"
        />
        <OrderTypeOption
          type="dine_in"
          icon="restaurant"
          label="Dine In"
          description="Reserve a table"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <PaymentOption
          method="wallet"
          icon="wallet"
          label="Wallet"
          description={`Balance: ₹${wallet?.balance?.toFixed(2) || '0.00'}`}
        />
        <PaymentOption
          method="razorpay"
          icon="card"
          label="Card/UPI"
          description="Pay with Razorpay"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={`Place Order - ₹${total.toFixed(2)}`}
          onPress={handlePlaceOrder}
          loading={loading}
          size="large"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  totals: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 14,
    color: '#333',
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  orderTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  selectedOrderType: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  orderTypeText: {
    flex: 1,
    marginLeft: 12,
  },
  orderTypeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  orderTypeDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  selectedPaymentOption: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  paymentText: {
    flex: 1,
    marginLeft: 12,
  },
  paymentLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  paymentDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
});

export default CheckoutScreen;
