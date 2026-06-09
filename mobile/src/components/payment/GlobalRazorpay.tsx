import React, { useState, forwardRef, useImperativeHandle } from 'react';
import RazorpayWebView, { RazorpayWebViewProps } from './RazorpayWebView';
import { PaymentOptions, PaymentResult } from '../../services/payment/razorpay';

export interface GlobalRazorpayRef {
  show: (options: PaymentOptions) => Promise<PaymentResult>;
}

let globalRazorpayRef: GlobalRazorpayRef | null = null;

export const setGlobalRazorpayRef = (ref: GlobalRazorpayRef | null) => {
  globalRazorpayRef = ref;
};

export const initiateGlobalPayment = (options: PaymentOptions): Promise<PaymentResult> => {
  if (!globalRazorpayRef) {
    return Promise.reject(new Error('GlobalRazorpay component is not mounted.'));
  }
  return globalRazorpayRef.show(options);
};

const GlobalRazorpay = forwardRef<GlobalRazorpayRef, {}>((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<any>(null);
  const [promiseHandlers, setPromiseHandlers] = useState<{
    resolve: (value: PaymentResult) => void;
    reject: (reason?: any) => void;
  } | null>(null);

  useImperativeHandle(ref, () => ({
    show: (paymentOptions: PaymentOptions) => {
      return new Promise<PaymentResult>((resolve, reject) => {
        setOptions({
          key: paymentOptions.key,
          amount: paymentOptions.amount * 100, // Amount in paise
          currency: paymentOptions.currency || 'INR',
          name: paymentOptions.name || 'Smart Canteen',
          description: paymentOptions.description || 'Smart Canteen Payment',
          image: 'https://your-app-logo-url.com/logo.png',
          order_id: paymentOptions.orderId,
          prefill: paymentOptions.prefill || {},
          theme: { color: '#007AFF' },
        });
        setPromiseHandlers({ resolve, reject });
        setVisible(true);
      });
    },
  }));

  const handleSuccess = (data: any) => {
    setVisible(false);
    if (promiseHandlers) {
      promiseHandlers.resolve({
        success: true,
        paymentId: data.razorpay_payment_id,
        orderId: data.razorpay_order_id,
        signature: data.razorpay_signature,
      });
      setPromiseHandlers(null);
    }
  };

  const handleError = (error: any) => {
    setVisible(false);
    if (promiseHandlers) {
      promiseHandlers.resolve({
        success: false,
        error: error?.description || error?.message || 'Payment failed',
      });
      setPromiseHandlers(null);
    }
  };

  const handleClose = () => {
    setVisible(false);
    if (promiseHandlers) {
      promiseHandlers.resolve({
        success: false,
        error: 'Payment cancelled by user',
      });
      setPromiseHandlers(null);
    }
  };

  return (
    <RazorpayWebView
      visible={visible}
      options={options}
      onSuccess={handleSuccess}
      onError={handleError}
      onClose={handleClose}
    />
  );
});

export default GlobalRazorpay;
