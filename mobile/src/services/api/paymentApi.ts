import apiClient from './apiClient';

export const paymentApi = {
    createRazorpayOrder: async (amount: number) => {
        const response = await apiClient.post('/api/payments/razorpay/create-order', { amount });
        return response.data;
    },

    verifyRazorpayPayment: async (paymentData: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
        paymentId: string;
    }) => {
        const response = await apiClient.post('/api/payments/razorpay/verify', paymentData);
        return response.data;
    }
};
