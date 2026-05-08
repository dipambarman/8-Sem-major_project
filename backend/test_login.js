import axios from 'axios';

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'student@gauhati.ac.in',
      password: 'test123'
    });
    console.log('Login success:', res.data);
  } catch (err) {
    console.error('Login failed:', err.response?.status, err.response?.data);
  }
}

testLogin();
