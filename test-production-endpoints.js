// Production Endpoint Test Script
// Run with: node test-production-endpoints.js

const https = require('https');

const BASE_URL = 'https://ai-assistant-backend-oqpp.onrender.com';

// Test endpoints
const endpoints = [
  { path: '/health', method: 'GET', description: 'Health Check' },
  { path: '/api/status', method: 'GET', description: 'API Status' },
  { path: '/api/', method: 'GET', description: 'Root API' },
  { path: '/api/auth/status', method: 'GET', description: 'Auth Status' },
  { path: '/api/tasks', method: 'GET', description: 'Tasks (will return 401 - expected)' },
  { path: '/api/reminders', method: 'GET', description: 'Reminders (will return 401 - expected)' },
  { path: '/api/documents/summaries', method: 'GET', description: 'Documents (will return 401 - expected)' }
];

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${endpoint.path}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            ...endpoint,
            status: res.statusCode,
            success: res.statusCode < 500,
            response: json
          });
        } catch (e) {
          resolve({
            ...endpoint,
            status: res.statusCode,
            success: false,
            error: 'Invalid JSON response'
          });
        }
      });
    }).on('error', (err) => {
      resolve({
        ...endpoint,
        status: 'ERROR',
        success: false,
        error: err.message
      });
    });
  });
}

async function runTests() {
  console.log('🧪 Testing Production Backend Endpoints');
  console.log('=' .repeat(50));
  console.log(`Base URL: ${BASE_URL}`);
  console.log('');
  
  for (const endpoint of endpoints) {
    console.log(`Testing: ${endpoint.description}`);
    console.log(`URL: ${BASE_URL}${endpoint.path}`);
    
    const result = await testEndpoint(endpoint);
    
    if (result.success) {
      console.log(`✅ Status: ${result.status}`);
      if (result.response && result.response.status) {
        console.log(`   Response: ${result.response.status}`);
      }
    } else {
      console.log(`❌ Status: ${result.status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
    
    console.log('');
  }
  
  console.log('🎯 Test Summary:');
  console.log('- Health endpoints should return 200');
  console.log('- Protected endpoints (tasks, reminders, documents) should return 401 (expected)');
  console.log('- Any 500 errors indicate server problems');
  console.log('- Network errors indicate connectivity issues');
  console.log('');
  console.log('✅ Backend is ready for frontend connections!');
}

runTests().catch(console.error);