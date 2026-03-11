import axios from 'axios';
import { getToken } from '../../utils/storage';
import Constants from 'expo-constants';

// Get API URL from environment
const getApiBaseUrl = () => {
    // Priority 1: Expo public env var
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    // Priority 2: Host URI (for local development on device)
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
        // Remove port and assume backend is on 3000
        const ip = hostUri.split(':')[0];
        return `http://${ip}:3000`;
    }

    // Priority 3: Default localhost
    return 'http://localhost:3000';
};

const API_BASE_URL = getApiBaseUrl();

export const paymentApi = {
    createRazorpayOrder: async (amount: number) => {
        const token = await getToken();
        const response = await axios.post(
            `${API_BASE_URL}/api/payments/razorpay/create-order`,
            { amount },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    },

    verifyRazorpayPayment: async (paymentData: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
        paymentId: string;
    }) => {
        const token = await getToken();
        const response = await axios.post(
            `${API_BASE_URL}/api/payments/razorpay/verify`,
            paymentData,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    }
};
