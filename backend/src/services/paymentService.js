import Razorpay from 'razorpay';
import crypto from 'crypto';

let razorpay = null;

// Initialize Razorpay safely — only if credentials are available
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } else {
    console.warn('⚠️ Razorpay credentials not found — payment features will be unavailable');
  }
} catch (error) {
  console.error('❌ Failed to initialize Razorpay:', error.message);
}

export const createRazorpayOrder = async (amount, currency = 'INR', receipt = null) => {
  if (!razorpay) {
    return { success: false, error: 'Razorpay not configured' };
  }

  const options = {
    amount: Math.round(amount * 100), // amount in paise
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
    payment_capture: 1,
  };

  try {
    const order = await razorpay.orders.create(options);
    return { success: true, data: order };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return { success: false, error: error.message };
  }
};

export const verifyPayment = (paymentId, orderId, signature) => {
  if (!process.env.RAZORPAY_KEY_SECRET) return false;

  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  return expectedSignature === signature;
};

export default razorpay;
