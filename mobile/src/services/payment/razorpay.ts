import Constants from 'expo-constants';
import { Alert, Platform } from 'react-native';

// Safely import Razorpay to avoid crashes in Expo Go
// Since react-native-razorpay is removed from package.json for Expo Go compatibility,
// RazorpayCheckout will always be null in Expo Go, triggering simulation mode.
// For production builds with real payments, you'll need to:
// 1. Add react-native-razorpay back to package.json
// 2. Create a custom development build (npx expo run:android/ios)
let RazorpayCheckout: any = null;
// Note: Removed dynamic require to prevent Metro bundler errors in Expo Go

export interface PaymentOptions {
  amount: number;
  currency?: string;
  orderId: string;
  key: string;
  name?: string;
  description?: string;
  prefill?: {
    email?: string;
    contact?: string;
    name?: string;
  };
}

export const initiatePayment = async (options: PaymentOptions) => {
  // Check for Expo Go environment OR if Razorpay SDK is not available
  const isExpoGo = Constants.appOwnership === 'expo' || !RazorpayCheckout;

  if (isExpoGo) {
    return new Promise((resolve) => {
      Alert.alert(
        'Expo Go Detected',
        'Native Razorpay SDK is not supported in Expo Go.\n\nSimulating a successful payment for testing UI flow.\n\n(Backend verification may fail without real signature)',
        [
          {
            text: 'Simulate Success',
            onPress: () => {
              resolve({
                success: true,
                paymentId: 'pay_mock_test_123456789',
                orderId: options.orderId,
                signature: 'mock_signature_for_expo_go',
              });
            },
          },
          {
            text: 'Cancel',
            onPress: () => resolve({
              success: false,
              error: 'Payment cancelled by user (Simulation)',
            }),
            style: 'cancel',
          },
        ]
      );
    });
  }

  const razorpayOptions = {
    key: options.key,
    description: options.description || 'Smart Canteen Payment',
    image: 'https://your-app-logo-url.com/logo.png',
    currency: options.currency || 'INR',
    amount: options.amount * 100, // Amount in paise
    name: options.name || 'Smart Canteen',
    order_id: options.orderId,
    prefill: options.prefill || {},
    theme: { color: '#007AFF' },
  };

  try {
    const data = await RazorpayCheckout.open(razorpayOptions);
    return {
      success: true,
      paymentId: data.razorpay_payment_id,
      orderId: data.razorpay_order_id,
      signature: data.razorpay_signature,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.description || error.message || 'Payment failed',
    };
  }
};
