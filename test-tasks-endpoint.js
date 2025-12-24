// Test tasks endpoint to debug issues
// Run with: node test-tasks-endpoint.js

const https = require('https');

const BASE_URL = 'https://ai-assistant-backend-oqpp.onrender.com';

// Test data for task creation
const validTaskData = {
  title: "Test Task",
  description: "This is a test task",
  priority: "medium",
  due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
  tags: ["test", "api"]
};

function testTaskEndpoint(method, path, data = null) {
  return new Promise((resolve) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: 'ai-assistant-backend-oqpp.onrender.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': 'Bearer fake-token-for-testing'
      }
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
            response: json,
            data: data
          });
        } catch (e) {
          resolve({
            method,
            path,
            status: res.statusCode,
            response: responseData,
            data: data
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        method,
        path,
        status: 'ERROR',
        error: err.message,
        data: data
      });
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTaskTests() {
  console.log('🧪 Testing Tasks API Endpoints');
  console.log('=' .repeat(50));
  
  const tests = [
    { method: 'GET', path: '/api/tasks', description: 'Get all tasks' },
    { method: 'POST', path: '/api/tasks', description: 'Create task', data: validTaskData },
    { method: 'POST', path: '/api/tasks/from-message', description: 'Create tasks from message', data: { message: "I need to buy groceries tomorrow and call the doctor next week" } },
    { method: 'POST', path: '/api/tasks/suggestions', description: 'Get task suggestions', data: { context: "work project" } }
  ];

  for (const test of tests) {
    console.log(`\n📋 ${test.description}`);
    console.log(`${test.method} ${test.path}`);
    
    const result = await testTaskEndpoint(test.method, test.path, test.data);
    
    console.log(`Status: ${result.status}`);
    
    if (result.status === 401) {
      console.log('✅ Expected: 401 (authentication required)');
      console.log('   Endpoint is working, just needs valid JWT token');
    } else if (result.status === 400) {
      console.log('❌ 400 Error - Validation failed');
      console.log('Response:', JSON.stringify(result.response, null, 2));
    } else if (result.status === 500) {
      console.log('❌ 500 Error - Server issue');
      console.log('Response:', JSON.stringify(result.response, null, 2));
    } else if (result.status === 404) {
      console.log('❌ 404 Error - Endpoint not found');
      console.log('Response:', JSON.stringify(result.response, null, 2));
    } else {
      console.log(`ℹ️  Status: ${result.status}`);
      console.log('Response:', JSON.stringify(result.response, null, 2));
    }
  }
  
  console.log('\n📋 Required Task Data Format:');
  console.log(JSON.stringify({
    title: "Task title (required)",
    description: "Task description (optional)",
    priority: "low|medium|high|urgent (optional, default: medium)",
    due_date: "ISO 8601 date string (optional)",
    tags: ["tag1", "tag2"] // optional array
  }, null, 2));
  
  console.log('\n🔍 Common Issues:');
  console.log('- Missing "title" field (required)');
  console.log('- Invalid priority value (must be: low, medium, high, urgent)');
  console.log('- Invalid due_date format (must be ISO 8601)');
  console.log('- Invalid tags format (must be array of strings)');
}

runTaskTests().catch(console.error);