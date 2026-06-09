const http = require('http');
const https = require('https');

const data = JSON.stringify({
  email: "test_register_fail@example.com",
  password: "password123",
  fullName: "Test User",
  phone: "9876543210"
});

const options = {
  hostname: 'smart-canteen-backend-qwf5.onrender.com',
  port: 443,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  let responseBody = '';
  console.log(`STATUS: ${res.statusCode}`);
  
  res.on('data', chunk => {
    responseBody += chunk;
  });

  res.on('end', () => {
    console.log('RESPONSE:', responseBody);
  });
});

req.on('error', error => {
  console.error('ERROR:', error);
});

req.write(data);
req.end();
