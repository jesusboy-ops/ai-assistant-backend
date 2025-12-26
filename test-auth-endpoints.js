// Test authentication endpoints
// Run with: node test-auth-endpoints.js

const https = require('https');

const BASE_URL = 'https://ai-assistant-backend-oqpp.onrender.com';

function makeRequest(method, path, data = null) {
  return new Promise((resolve) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: 'ai-assistant-backend-oqpp.onrender.com',
      port: 443,
      path: path,
      method: method,
      headers: {}
    };

    if (postData) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          resolve({
            method,
            path,
            status: res.statusCode,
            response: json
          });
        } catch (e) {
          resolve({
            method,
            path,
            status: res.statusCode,
            response: responseData,
            rawResponse: true
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        method,
        path,
        status: 'ERROR',
        error: err.message
      });
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testAuthEndpoints() {
  console.log('🔐 Testing Authentication Endpoints');
  console.log('=' .repeat(50));
  console.log(`Base URL: ${BASE_URL}`);
  console.log('');

  const tests = [
    {
      method: 'GET',
      path: '/api/auth/status',
      description: 'Auth service status'
    },
    {
      method: 'POST',
      path: '/api/auth/login',
      description: 'Login with test credentials',
      data: {
        email: 'test@test.com',
        password: 'testpass123'
      }
    },
    {
      method: 'POST',
      path: '/api/auth/register',
      description: 'Register new user',
      data: {
        name: 'Test User',
        email: 'newuser@test.com',
        password: 'testpass123'
      }
    },
    {
      method: 'POST',
      path: '/api/auth/login',
      description: 'Login with invalid data (missing password)',
      data: {
        email: 'test@test.com'
      }
    },
    {
      method: 'POST',
      path: '/api/auth/login',
      description: 'Login with invalid email format',
      data: {
        email: 'invalid-email',
        password: 'testpass123'
      }
    }
  ];

  for (const test of tests) {
    console.log(`\n📋 ${test.description}`);
    console.log(`${test.method} ${test.path}`);
    if (test.data) {
      console.log('Data:', JSON.stringify(test.data, null, 2));
    }
    
    const result = await makeRequest(test.method, test.path, test.data);
    
    console.log(`Status: ${result.status}`);
    
    if (result.status === 200) {
      console.log('✅ Success!');
      console.log('Response:', JSON.stringify(result.response, null, 2));
    } else if (result.status === 400) {
      console.log('⚠️  400 Error - Validation failed');
      console.log('Response:', JSON.stringify(result.response, null, 2));
    } else if (result.status === 401) {
      console.log('⚠️  401 Error - Authentication failed');
      console.log('Response:', JSON.stringify(result.response, null, 2));
    } else if (result.status === 500) {
      console.log('❌ 500 Error - Server issue');
      console.log('Response:', result.rawResponse ? result.response : JSON.stringify(result.response, null, 2));
    } else if (result.status === 'ERROR') {
      console.log('❌ Network Error');
      console.log('Error:', result.error);
    } else {
      console.log(`ℹ️  Status: ${result.status}`);
      console.log('Response:', result.rawResponse ? result.response : JSON.stringify(result.response, null, 2));
    }
  }

  console.log('\n🎯 Authentication Diagnosis');
  console.log('=' .repeat(50));
  console.log('If you see 500 errors, possible causes:');
  console.log('• Database connection issues');
  console.log('• Missing environment variables');
  console.log('• Supabase authentication not configured');
  console.log('• JWT secret missing or invalid');
  console.log('');
  console.log('If you see network errors (ERR_FAILED):');
  console.log('• Backend might be restarting');
  console.log('• CORS issues');
  console.log('• Frontend URL not in allowed origins');
  console.log('• Network connectivity problems');
}

testAuthEndpoints().catch(console.error);