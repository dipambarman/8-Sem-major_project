import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState, AppDispatch } from '../../store/store';
import { createOrder } from '../../store/slices/orderSlice';
import { fetchWallet } from '../../store/slices/walletSlice';
import { clearCart, incrementQuantity, decrementQuantity } from '../../store/slices/cartSlice';
import { initiatePayment } from '../../services/payment/razorpay';
import { paymentApi } from '../../services/api/paymentApi';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Colors, Radius, Spacing } from '../../theme/colors';
import { Typography } from '../../theme/typography';

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const { items: cartItems } = useSelector((state: RootState) => state.cart);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🛒 CheckboxScreen - Cart Items:', JSON.stringify(cartItems, null, 2));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const { user } = useSelector((state: RootState) => state.auth);
  const { wallet } = useSelector((state: RootState) => state.wallet);

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // Create a separate effect for fetching wallet to avoid infinite loops or missing data
  React.useEffect(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  // Navigate back if cart becomes empty from decrementing
  React.useEffect(() => {
    if (cartItems.length === 0) {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        (navigation as any).navigate('Main', { screen: 'Home' });
      }
    }
  }, [cartItems.length, navigation]);

  const [orderType, setOrderType] = useState<'delivery' | 'pickup' | 'dine_in'>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'razorpay'>('wallet');
  const [loading, setLoading] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
  const deliveryFee = orderType === 'delivery' ? (subtotal > 100 ? 0 : 20) : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      if (Platform.OS === 'web') window.alert('Your cart is empty');
      else Alert.alert('Error', 'Your cart is empty');
      return;
    }

    // Check if wallet is loaded and has sufficient balance
    if (paymentMethod === 'wallet') {
      if (!wallet) {
        if (Platform.OS === 'web') window.alert('Wallet information not available. Please try again.');
        else Alert.alert('Error', 'Wallet information not available. Please try again.');
        dispatch(fetchWallet()); // execution might recover next time
        return;
      }
      if (wallet.balance < total) {
        if (Platform.OS === 'web') window.alert('Please top up your wallet or choose another payment method');
        else Alert.alert('Insufficient Balance', 'Please top up your wallet or choose another payment method');
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
          key: key,
          description: 'Smart Canteen Order',
          prefill: {
            email: user?.email,
            contact: user?.phone,
            name: user?.fullName,
          },
        });

        if (!paymentData.success) {
          setLoading(false);
          if (Platform.OS === 'web') window.alert(paymentData.error);
          else Alert.alert('Payment Failed', paymentData.error);
          return;
        }

        // 3. Verify Payment on Backend
        if (paymentData.signature === 'mock_signature_for_expo_go') {
          paymentResult = {
            id: paymentData.paymentId,
            status: 'successful',
            mocked: true
          };
        } else {
          const verifyResponse = await paymentApi.verifyRazorpayPayment({
            razorpay_order_id: paymentData.orderId,
            razorpay_payment_id: paymentData.paymentId,
            razorpay_signature: paymentData.signature,
            paymentId: paymentId
          });

          if (!verifyResponse.success) {
            throw new Error('Payment verification failed');
          }

          paymentResult = verifyResponse.data;
        }
      }

      const orderData = {
        items: cartItems.map(item => ({
          menuItemId: Number(item.id),
          quantity: item.quantity,
        })),
        orderType,
        paymentMethod,
        paymentDetails: paymentResult,
      };

      const result = await dispatch(createOrder(orderData)).unwrap();

      dispatch(clearCart());

      if (Platform.OS === 'web') {
        window.alert(`🎉 Order Placed!\nYour order #${result.id} has been placed successfully`);
        (navigation as any).navigate('OrderTracking', { orderId: result.id });
      } else {
        Alert.alert(
          '🎉 Order Placed!',
          `Your order #${result.id} has been placed successfully`,
          [
            {
              text: 'Track Order',
              onPress: () => (navigation as any).navigate('OrderTracking', { orderId: result.id }),
            },
          ]
        );
      }
    } catch (error) {
      if (Platform.OS === 'web') window.alert('Failed to place order. Please try again.');
      else Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ORDER_TYPES = [
    { type: 'pickup' as const, icon: 'bag', label: 'Pickup', desc: 'Ready in 15-20 mins', color: '#10B981' },
    { type: 'delivery' as const, icon: 'bicycle', label: 'Delivery', desc: 'Delivered to your location', color: '#3B82F6' },
    { type: 'dine_in' as const, icon: 'restaurant', label: 'Dine In', desc: 'Enjoy at the canteen', color: '#8B5CF6' },
  ];

  const PAYMENT_METHODS = [
    { method: 'wallet' as const, icon: 'wallet', label: 'Wallet', desc: `Balance: ₹${wallet?.balance?.toFixed(2) || '0.00'}`, color: Colors.accent.primary },
    { method: 'razorpay' as const, icon: 'card', label: 'Card / UPI', desc: 'Pay with Razorpay', color: '#3B82F6' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner message="Processing your order..." />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[isTablet && { width: '100%', maxWidth: 800, alignSelf: 'center', paddingTop: Spacing.xl }]}
      >
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.itemLeft}>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => dispatch(decrementQuantity(item.id))}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="remove" size={14} color={Colors.accent.primary} />
                  </TouchableOpacity>

                  <Text style={styles.quantityText}>{item.quantity}</Text>

                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => dispatch(incrementQuantity(item.id))}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={14} color={Colors.accent.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.itemName}>{item.name}</Text>
              </View>
              <Text style={styles.itemPrice}>₹{((item.price || 0) * item.quantity).toFixed(0)}</Text>
            </View>
          ))}

          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>₹{subtotal.toFixed(0)}</Text>
            </View>
            {deliveryFee > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Delivery Fee</Text>
                <Text style={styles.totalValue}>₹{deliveryFee.toFixed(0)}</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>₹{total.toFixed(0)}</Text>
            </View>
          </View>
        </View>

        {/* Order Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Type</Text>
          {ORDER_TYPES.map(({ type, icon, label, desc, color }) => (
            <TouchableOpacity
              key={type}
              style={[styles.optionCard, orderType === type && styles.optionCardActive]}
              onPress={() => setOrderType(type)}
            >
              <View style={[styles.optionIconBox, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon as any} size={22} color={color} />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>{label}</Text>
                <Text style={styles.optionDesc}>{desc}</Text>
              </View>
              {orderType === type ? (
                <Ionicons name="checkmark-circle" size={22} color={Colors.accent.primary} />
              ) : (
                <View style={styles.optionRadio} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Dine-In Note */}
        {orderType === 'dine_in' && (
          <View style={styles.dineInNote}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.1)', 'rgba(139, 92, 246, 0.05)']}
              style={styles.dineInNoteGradient}
            >
              <Ionicons name="information-circle" size={20} color="#8B5CF6" />
              <Text style={styles.dineInNoteText}>
                Your food will be served at your table. Don't forget to book a table if you haven't already!
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          {PAYMENT_METHODS.map(({ method, icon, label, desc, color }) => (
            <TouchableOpacity
              key={method}
              style={[styles.optionCard, paymentMethod === method && styles.optionCardActive]}
              onPress={() => setPaymentMethod(method)}
            >
              <View style={[styles.optionIconBox, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon as any} size={22} color={color} />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>{label}</Text>
                <Text style={styles.optionDesc}>{desc}</Text>
              </View>
              {paymentMethod === method ? (
                <Ionicons name="checkmark-circle" size={22} color={Colors.accent.primary} />
              ) : (
                <View style={styles.optionRadio} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View style={styles.bottomBarContainer} pointerEvents="box-none">
        <View style={[styles.bottomBar, isTablet && styles.bottomBarTablet]}>
          <View style={styles.bottomInfo}>
            <Text style={styles.bottomLabel}>Total</Text>
            <Text style={styles.bottomPrice}>₹{total.toFixed(0)}</Text>
          </View>
          <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder} activeOpacity={0.85}>
            <LinearGradient colors={Colors.gradients.goldCta} style={styles.placeOrderGradient}>
              <Text style={styles.placeOrderText}>Place Order</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.background.primary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  // Sections
  section: {
    backgroundColor: Colors.background.card,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },

  // Order Items
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.secondary,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  quantityButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    ...Typography.captionBold,
    color: Colors.text.primary,
    minWidth: 16,
    textAlign: 'center',
  },
  itemName: {
    ...Typography.body,
    color: Colors.text.primary,
    flex: 1,
  },
  itemPrice: {
    ...Typography.label,
    color: Colors.text.primary,
  },

  // Totals
  totals: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalLabel: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  totalValue: {
    ...Typography.body,
    color: Colors.text.primary,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
    paddingTop: 10,
    marginTop: 8,
  },
  grandTotalLabel: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  grandTotalValue: {
    ...Typography.h4,
    color: Colors.accent.primary,
  },

  // Option Cards
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 8,
    backgroundColor: Colors.background.tertiary,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  optionCardActive: {
    borderColor: Colors.accent.primary,
    backgroundColor: Colors.accent.muted,
  },
  optionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    ...Typography.label,
    color: Colors.text.primary,
  },
  optionDesc: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border.primary,
  },

  // Dine-In Note
  dineInNote: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  dineInNoteGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  dineInNoteText: {
    ...Typography.bodySm,
    color: '#A78BFA',
    flex: 1,
  },

  // Bottom Bar
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bottomBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomBarTablet: {
    maxWidth: 800,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 0,
  },
  bottomInfo: {
    marginRight: Spacing.xl,
  },
  bottomLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  bottomPrice: {
    ...Typography.priceLg,
    color: Colors.accent.primary,
    fontSize: 22,
  },
  placeOrderBtn: {
    flex: 1,
    borderRadius: Radius.button,
    overflow: 'hidden',
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  placeOrderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  placeOrderText: {
    ...Typography.button,
    color: Colors.background.primary,
  },
});

export default CheckoutScreen;
