// Test frontend connectivity to deployed backend
const BACKEND_URL = 'https://ai-assistant-backend-oqpp.onrender.com';

async function testFrontendConnection() {
  console.log('🔍 Testing Frontend Connection to Deployed Backend...\n');
  console.log('Backend URL:', BACKEND_URL);

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check passed');
      console.log('   Status:', healthData.status);
      console.log('   Environment:', healthData.environment);
    } else {
      console.log('❌ Health check failed:', healthResponse.status);
    }

    // Test 2: API Status
    console.log('\n2. Testing API status...');
    const statusResponse = await fetch(`${BACKEND_URL}/api/status`);
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('✅ API status check passed');
      console.log('   API:', statusData.api);
    } else {
      console.log('❌ API status failed:', statusResponse.status);
    }

    // Test 3: CORS preflight (OPTIONS request)
    console.log('\n3. Testing CORS preflight...');
    try {
      const corsResponse = await fetch(`${BACKEND_URL}/api/status`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://example.com',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      console.log('✅ CORS preflight response:', corsResponse.status);
      console.log('   Headers:', Object.fromEntries(corsResponse.headers.entries()));
    } catch (corsError) {
      console.log('❌ CORS preflight failed:', corsError.message);
    }

    // Test 4: Authentication endpoint
    console.log('\n4. Testing auth endpoint...');
    const authResponse = await fetch(`${BACKEND_URL}/api/auth/status`);
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('✅ Auth endpoint working');
      console.log('   Service:', authData.service);
    } else {
      console.log('❌ Auth endpoint failed:', authResponse.status);
    }

    // Test 5: Simulate frontend request
    console.log('\n5. Simulating frontend request...');
    const frontendRequest = await fetch(`${BACKEND_URL}/api/tasks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://your-frontend.vercel.app'
      }
    });

    console.log('Frontend simulation status:', frontendRequest.status);
    if (!frontendRequest.ok) {
      const errorText = await frontendRequest.text();
      console.log('Error response:', errorText);
    }

    console.log('\n🎯 Connection test completed!');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n🔧 Possible solutions:');
      console.log('1. Check if backend is deployed and running');
      console.log('2. Verify the backend URL is correct');
      console.log('3. Check network connectivity');
    }
  }
}

testFrontendConnection();