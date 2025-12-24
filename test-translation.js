// Test translation endpoint locally
// Run with: node test-translation.js

const axios = require('axios');

const BASE_URL = 'http://localhost:5000'; // Local testing

async function testTranslation() {
  try {
    console.log('🌐 Testing Translation Service');
    console.log('=' .repeat(40));
    
    // Test direct LibreTranslate API first
    console.log('1. Testing direct LibreTranslate API...');
    try {
      const directResponse = await axios.post('https://libretranslate.de/translate', {
        q: 'Hello world',
        source: 'en',
        target: 'es',
        format: 'text'
      }, { timeout: 5000 });
      
      console.log('✅ Direct API works:', directResponse.data.translatedText);
    } catch (error) {
      console.log('❌ Direct API failed:', error.message);
    }
    
    console.log('');
    console.log('2. Testing backend proxy (will fail without auth token)...');
    
    // Test our backend endpoint (will get 401 without token, but that's expected)
    try {
      const response = await axios.post(`${BASE_URL}/api/translation/translate`, {
        text: 'Hello world',
        source: 'en',
        target: 'es'
      }, {
        headers: {
          'Authorization': 'Bearer fake-token'
        },
        timeout: 5000
      });
      
      console.log('✅ Backend proxy works:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Backend proxy endpoint exists (401 auth error expected)');
      } else {
        console.log('❌ Backend proxy failed:', error.message);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testTranslation();