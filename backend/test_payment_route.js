import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Generate a valid token for user ID 1
const token = jwt.sign({ userId: 1, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });

async function testPayment() {
  try {
    const res = await fetch('http://localhost:3000/api/payments/razorpay/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount: 55 })
    });
    
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testPayment();
