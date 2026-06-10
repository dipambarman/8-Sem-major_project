import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { initiatePayment } from '../../services/payment/razorpay';
import { paymentApi } from '../../services/api/paymentApi';
import { RootState, AppDispatch } from '../../store/store';
import { topUpWallet } from '../../store/slices/walletSlice';
import TopUpModal from '../../components/wallet/TopUpModal';

const TopUpScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const { wallet, isLoading } = useSelector((state: RootState) => state.wallet);

  const [modalVisible, setModalVisible] = useState(true);

  const handleTopUp = async (amount: number) => {
    try {
      let orderId = '';
      let rzpKey = '';

      // First create order via backend to get a valid Razorpay order ID
      try {
        const orderResponse = await paymentApi.createRazorpayOrder(amount);
        if (orderResponse.success) {
          orderId = orderResponse.data.razorpayOrderId;
          rzpKey = orderResponse.data.key;
        } else {
          throw new Error('Failed to create payment order on backend');
        }
      } catch (err: any) {
        console.warn('Backend order creation failed, using fallback/mock:', err);
        // Fallback for mock/test if backend is offline or fails
        orderId = `TOPUP_${Date.now()}`;
        rzpKey = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_key';
      }

      // Use the payment service wrapper that handles Expo Go compatibility
      const paymentResult = await initiatePayment({
        amount,
        orderId,
        key: rzpKey,
        description: 'Smart Canteen Wallet Top-up',
        name: 'Smart Canteen',
        prefill: {
          email: user?.email || '',
          contact: user?.phone || '',
          name: user?.fullName || '',
        },
      });

      if (paymentResult.success) {
        // Prepare payload for top-up
        const payload: { amount: number; paymentId?: string; orderId?: string; signature?: string } = {
          amount,
        };

        // If not mock signature, include verification data
        if (paymentResult.signature && paymentResult.signature !== 'mock_signature_for_expo_go') {
          payload.paymentId = paymentResult.paymentId;
          payload.orderId = paymentResult.orderId;
          payload.signature = paymentResult.signature;
        }

        // Payment successful, update wallet
        await dispatch(topUpWallet(payload)).unwrap();

        if (Platform.OS === 'web') {
          window.alert(`Success!\n₹${amount} has been added to your wallet`);
          navigation.goBack();
        } else {
          Alert.alert(
            'Success!',
            `₹${amount} has been added to your wallet`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      } else {
        if (Platform.OS === 'web') window.alert(paymentResult.error || 'Please try again');
        else Alert.alert('Payment Failed', paymentResult.error || 'Please try again');
      }
    } catch (error: any) {
      console.error('Payment failed:', error);
      if (Platform.OS === 'web') window.alert('Please try again');
      else Alert.alert('Payment Failed', 'Please try again');
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TopUpModal
        visible={modalVisible}
        onClose={handleClose}
        onTopUp={handleTopUp}
        loading={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});

export default TopUpScreen;
