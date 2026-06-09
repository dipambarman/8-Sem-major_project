import Razorpay from 'razorpay';
import crypto from 'crypto';

let razorpay = null;

// IMPORTANT: do not initialize on module load.
// Some runtimes/entrypoints load env late; initializing here can freeze `razorpay` as null.
const getRazorpay = () => {
  if (razorpay) return razorpay;

  try {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      console.log('✅ Razorpay initialized with key:', process.env.RAZORPAY_KEY_ID);
      return razorpay;
    }

    console.warn('⚠️ Razorpay credentials not found — payment features will be unavailable');
    console.warn('   RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'SET' : 'MISSING');
    console.warn('   RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'MISSING');
    return null;
  } catch (error) {
    console.error('❌ Failed to initialize Razorpay:', (error && error.message) ? error.message : error);
    return null;
  }
};


export const createRazorpayOrder = async (amount, currency = 'INR', receipt = null) => {
  const instance = getRazorpay();
  if (!instance) {
    return { success: false, error: 'Razorpay not configured' };
  }

  const options = {
    amount: Math.round(amount * 100), // amount in paise
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
    payment_capture: 1,
  };

  try {
    const order = await instance.orders.create(options);
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

// Export the lazy getter function (NOT the null variable)
export default getRazorpay;

