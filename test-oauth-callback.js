const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

async function testOAuthEndpoints() {
  console.log('🔐 Testing Google OAuth Endpoints...\n');

  try {
    // Test 1: Get Google OAuth URL
    console.log('1. Testing GET /api/auth/oauth/google/url');
    const urlResponse = await axios.get(`${BASE_URL}/api/auth/oauth/google/url`);
    console.log('✅ OAuth URL endpoint working');
    console.log('📋 Auth URL:', urlResponse.data.authUrl);
    console.log('');

    // Test 2: Test callback endpoint with missing code (should redirect to error)
    console.log('2. Testing GET /api/auth/oauth/google/callback (no code)');
    try {
      await axios.get(`${BASE_URL}/api/auth/oauth/google/callback`, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        }
      });
    } catch (error) {
      if (error.response && error.response.status === 302) {
        console.log('✅ Callback endpoint redirects correctly for missing code');
        console.log('📋 Redirect location:', error.response.headers.location);
      } else {
        console.log('❌ Unexpected response:', error.message);
      }
    }
    console.log('');

    // Test 3: Test callback endpoint with error parameter
    console.log('3. Testing GET /api/auth/oauth/google/callback (with error)');
    try {
      await axios.get(`${BASE_URL}/api/auth/oauth/google/callback?error=access_denied`, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        }
      });
    } catch (error) {
      if (error.response && error.response.status === 302) {
        console.log('✅ Callback endpoint handles OAuth errors correctly');
        console.log('📋 Redirect location:', error.response.headers.location);
      } else {
        console.log('❌ Unexpected response:', error.message);
      }
    }
    console.log('');

    console.log('🎉 OAuth endpoint tests completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Set up your Google OAuth credentials in .env file');
    console.log('2. Configure your Google Cloud Console with the callback URL');
    console.log('3. Test the full OAuth flow with a real authorization code');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run tests
testOAuthEndpoints();