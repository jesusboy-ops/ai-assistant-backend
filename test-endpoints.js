#!/usr/bin/env node

/**
 * Quick endpoint testing script
 * Run with: node test-endpoints.js
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

// Test endpoints
const endpoints = [
  { method: 'GET', path: '/health', description: 'Health check' },
  { method: 'GET', path: '/api/status', description: 'API status' },
  { method: 'OPTIONS', path: '/api/auth/login', description: 'CORS preflight' },
];

function makeRequest(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(BASE_URL + endpoint.path);
    const client = url.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: endpoint.method,
      headers: {
        'Origin': 'http://localhost:3000',
        'Content-Type': 'application/json'
      },
      timeout: 5000
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          success: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 0,
        error: error.message,
        success: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: 0,
        error: 'Request timeout',
        success: false
      });
    });

    req.end();
  });
}

async function testEndpoints() {
  console.log('🧪 Testing API endpoints...\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  for (const endpoint of endpoints) {
    process.stdout.write(`Testing ${endpoint.method} ${endpoint.path} (${endpoint.description})... `);
    
    const result = await makeRequest(endpoint);
    
    if (result.success) {
      console.log('✅ PASS');
      if (endpoint.path === '/health' && result.data) {
        try {
          const health = JSON.parse(result.data);
          console.log(`   Status: ${health.status}, Uptime: ${Math.floor(health.uptime || 0)}s`);
        } catch (e) {
          console.log(`   Response: ${result.data.substring(0, 100)}`);
        }
      }
    } else {
      console.log('❌ FAIL');
      console.log(`   Status: ${result.status}`);
      console.log(`   Error: ${result.error || 'Unknown error'}`);
    }
  }

  // Test CORS headers
  console.log('\n🌐 Testing CORS headers...');
  const corsTest = await makeRequest({ method: 'OPTIONS', path: '/api/auth/login' });
  
  if (corsTest.success) {
    console.log('✅ CORS preflight successful');
    const corsHeaders = [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers',
      'access-control-allow-credentials'
    ];
    
    corsHeaders.forEach(header => {
      if (corsTest.headers[header]) {
        console.log(`   ${header}: ${corsTest.headers[header]}`);
      }
    });
  } else {
    console.log('❌ CORS preflight failed');
    console.log(`   Status: ${corsTest.status}`);
    console.log(`   Error: ${corsTest.error}`);
  }

  console.log('\n📊 Test Summary:');
  console.log('- If health check passes: ✅ Server is running');
  console.log('- If CORS passes: ✅ Frontend can connect');
  console.log('- If any test fails: ❌ Check server logs and configuration');
  
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Ensure server is running: npm run dev');
  console.log('2. Check .env file has correct values');
  console.log('3. Verify no firewall is blocking port 5000');
  console.log('4. See FRONTEND_CONNECTIVITY_GUIDE.md for detailed help');
}

// Run tests
testEndpoints().catch(console.error);