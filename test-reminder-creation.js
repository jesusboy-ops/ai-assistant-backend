// Test reminder creation to debug 400 error
// Run with: node test-reminder-creation.js

const https = require('https');

const BASE_URL = 'https://ai-assistant-backend-oqpp.onrender.com';

// Test data - what your frontend should send
const validReminderData = {
  title: "Test Reminder",
  description: "This is a test reminder",
  reminder_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
  repeat_type: "none",
  repeat_interval: 1
};

const invalidReminderData = {
  // Missing required title
  description: "This will fail",
  reminder_time: "invalid-date"
};

function testReminderCreation(data, testName) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'ai-assistant-backend-oqpp.onrender.com',
      port: 443,
      path: '/api/reminders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        // Note: This will fail with 401 because we don't have a real token
        // But we can see if it's a validation (400) or auth (401) error
        'Authorization': 'Bearer fake-token-for-testing'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          resolve({
            testName,
            status: res.statusCode,
            response: json,
            data: data
          });
        } catch (e) {
          resolve({
            testName,
            status: res.statusCode,
            response: responseData,
            data: data
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        testName,
        status: 'ERROR',
        error: err.message,
        data: data
      });
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Reminder Creation API');
  console.log('=' .repeat(50));
  
  // Test 1: Valid data (should get 401 - auth error, not 400 - validation error)
  console.log('Test 1: Valid reminder data');
  const test1 = await testReminderCreation(validReminderData, 'Valid Data');
  console.log(`Status: ${test1.status}`);
  console.log(`Response:`, test1.response);
  console.log('Expected: 401 (auth error) - means validation passed');
  console.log('');
  
  // Test 2: Invalid data (should get 400 - validation error)
  console.log('Test 2: Invalid reminder data');
  const test2 = await testReminderCreation(invalidReminderData, 'Invalid Data');
  console.log(`Status: ${test2.status}`);
  console.log(`Response:`, test2.response);
  console.log('Expected: 400 (validation error)');
  console.log('');
  
  console.log('📋 Required Fields for Reminder Creation:');
  console.log('✅ title (string, required, not empty)');
  console.log('⚪ description (string, optional)');
  console.log('✅ reminder_time (ISO 8601 date string, required)');
  console.log('⚪ repeat_type (optional: "none", "daily", "weekly", "monthly", "yearly")');
  console.log('⚪ repeat_interval (optional: integer >= 1)');
  console.log('');
  
  console.log('📝 Correct Frontend Data Format:');
  console.log(JSON.stringify({
    title: "Meeting with John",
    description: "Discuss project updates",
    reminder_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    repeat_type: "weekly",
    repeat_interval: 1
  }, null, 2));
  
  console.log('');
  console.log('🔍 Common Issues:');
  console.log('- Missing "title" field');
  console.log('- Invalid date format for "reminder_time" (must be ISO 8601)');
  console.log('- Invalid repeat_type value');
  console.log('- repeat_interval less than 1');
}

runTests().catch(console.error);