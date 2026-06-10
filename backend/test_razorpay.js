import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function test() {
  try {
    const order = await razorpay.orders.create({
      amount: 5500, // 55 INR in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: "1",
        orderId: "wallet_topup"
      }
    });
    console.log("SUCCESS:", order);
  } catch (err) {
    console.error("ERROR:");
    console.error(err);
  }
}

test();
