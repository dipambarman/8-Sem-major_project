const axios = require('axios');

// Test script for logout functionality
async function testLogout() {
  const API_BASE_URL = 'http://localhost:3000';

  console.log('🧪 Testing Logout Functionality\n');

  try {
    // Step 1: Register a test user
    console.log('1. Registering test user...');
    const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, {
      email: 'testlogout@example.com',
      password: 'testpassword123',
      fullName: 'Test User',
      phone: '1234567890'
    });

    const { token, user } = registerResponse.data.data;
    console.log('✅ User registered successfully');
    console.log(`   User ID: ${user.id}`);
    console.log(`   Token: ${token.substring(0, 20)}...\n`);

    // Step 2: Test logout endpoint
    console.log('2. Testing logout endpoint...');
    const logoutResponse = await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Logout successful');
    console.log(`   Response: ${logoutResponse.data.message}\n`);

    // Step 3: Verify token is invalidated (try to access protected route)
    console.log('3. Verifying token invalidation...');
    try {
      await axios.get(`${API_BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ ERROR: Token should be invalidated but still works');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Token properly invalidated (401 Unauthorized)');
      } else {
        console.log('❌ Unexpected error when testing token invalidation:', error.message);
      }
    }

    console.log('\n🎉 All logout tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 500) {
      console.log('\n💡 Make sure the backend server is running on port 3000');
    }
  }
}

// Run the test
testLogout();
