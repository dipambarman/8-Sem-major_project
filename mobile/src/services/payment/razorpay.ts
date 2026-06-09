import { initiateGlobalPayment } from '../../components/payment/GlobalRazorpay';

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

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
}

export const initiatePayment = async (options: PaymentOptions): Promise<PaymentResult> => {
  try {
    return await initiateGlobalPayment(options);
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Payment failed',
    };
  }
};
