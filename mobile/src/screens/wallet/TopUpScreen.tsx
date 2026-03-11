import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { initiatePayment } from '../../services/payment/razorpay';
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
      // Use the payment service wrapper that handles Expo Go compatibility
      const paymentResult = await initiatePayment({
        amount,
        orderId: `TOPUP_${Date.now()}`,
        key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_key',
        description: 'Smart Canteen Wallet Top-up',
        name: 'Smart Canteen',
        prefill: {
          email: user?.email || '',
          contact: user?.phone || '',
          name: user?.fullName || '',
        },
      });

      if (paymentResult.success) {
        // Payment successful, update wallet
        await dispatch(topUpWallet(amount)).unwrap();

        Alert.alert(
          'Success!',
          `₹${amount} has been added to your wallet`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Payment Failed', paymentResult.error || 'Please try again');
      }
    } catch (error: any) {
      console.error('Payment failed:', error);
      Alert.alert('Payment Failed', 'Please try again');
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
