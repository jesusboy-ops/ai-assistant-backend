require('dotenv').config();

const API_BASE = process.env.API_URL || 'http://localhost:5000/api';

/**
 * Test CORS headers
 */
async function testCorsHeaders() {
  console.log('🔍 Testing CORS Headers...\n');

  try {
    // Test preflight request
    console.log('1. Testing preflight OPTIONS request...');
    const preflightResponse = await fetch(`${API_BASE}/tasks`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://myapp.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });

    console.log('✅ Preflight response status:', preflightResponse.status);
    console.log('✅ CORS headers:');
    console.log('  - Access-Control-Allow-Origin:', preflightResponse.headers.get('Access-Control-Allow-Origin'));
    console.log('  - Access-Control-Allow-Methods:', preflightResponse.headers.get('Access-Control-Allow-Methods'));
    console.log('  - Access-Control-Allow-Headers:', preflightResponse.headers.get('Access-Control-Allow-Headers'));
    console.log('  - Access-Control-Allow-Credentials:', preflightResponse.headers.get('Access-Control-Allow-Credentials'));

    // Test actual request with different origins
    console.log('\n2. Testing actual requests with different origins...');
    
    const origins = [
      'http://localhost:3000',
      'https://myapp.vercel.app',
      'https://myapp.netlify.app',
      'https://custom-domain.com'
    ];

    for (const origin of origins) {
      const response = await fetch(`${API_BASE}/status`, {
        headers: { 'Origin': origin }
      });
      
      const corsOrigin = response.headers.get('Access-Control-Allow-Origin');
      console.log(`  - Origin: ${origin} → CORS: ${corsOrigin}`);
    }

    console.log('\n🎉 CORS test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCorsHeaders();