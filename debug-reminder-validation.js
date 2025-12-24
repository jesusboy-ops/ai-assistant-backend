// Debug reminder validation errors
// Run with: node debug-reminder-validation.js

const https = require('https');

const BASE_URL = 'https://ai-assistant-backend-oqpp.onrender.com';

function testReminderValidation(data, testName) {
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
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3OC05MGFiLWNkZWYtMTIzNC01Njc4OTBhYmNkZWYiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpYXQiOjE2MzQ1Njc4OTB9.test-token'
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

async function runValidationTests() {
  console.log('🧪 Testing Reminder Validation');
  console.log('=' .repeat(50));
  
  const tests = [
    {
      name: 'Valid reminder data',
      data: {
        title: "Test Reminder",
        description: "This is a test reminder",
        reminder_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        repeat_type: "none",
        repeat_interval: 1
      }
    },
    {
      name: 'Missing title (should fail)',
      data: {
        description: "This should fail",
        reminder_time: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      }
    },
    {
      name: 'Invalid reminder_time (should fail)',
      data: {
        title: "Test Reminder",
        reminder_time: "invalid-date"
      }
    },
    {
      name: 'Invalid repeat_type (should fail)',
      data: {
        title: "Test Reminder",
        reminder_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        repeat_type: "invalid-type"
      }
    },
    {
      name: 'Invalid repeat_interval (should fail)',
      data: {
        title: "Test Reminder",
        reminder_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        repeat_interval: 0
      }
    },
    {
      name: 'Common frontend format (might fail)',
      data: {
        title: "Meeting with John",
        description: "Discuss project updates",
        reminderTime: "2025-12-25T14:30:00.000Z", // Wrong field name
        repeatType: "weekly", // Wrong field name
        repeatInterval: 1 // Wrong field name
      }
    }
  ];

  for (const test of tests) {
    console.log(`\n📋 Test: ${test.name}`);
    console.log('Data:', JSON.stringify(test.data, null, 2));
    
    const result = await testReminderValidation(test.data, test.name);
    
    console.log(`Status: ${result.status}`);
    
    if (result.status === 400) {
      console.log('❌ Validation failed');
      if (result.response && result.response.details) {
        console.log('Validation errors:');
        result.response.details.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error.msg || error.message} (field: ${error.param || error.path})`);
        });
      } else {
        console.log('Response:', JSON.stringify(result.response, null, 2));
      }
    } else if (result.status === 401) {
      console.log('✅ Validation passed (401 = auth issue, not validation)');
    } else {
      console.log(`Status: ${result.status}`);
      console.log('Response:', JSON.stringify(result.response, null, 2));
    }
  }
  
  console.log('\n📋 Correct Reminder Format:');
  console.log(JSON.stringify({
    title: "Meeting with John",                    // Required: string, not empty
    description: "Discuss project updates",       // Optional: string
    reminder_time: "2025-12-25T14:30:00.000Z",   // Required: ISO 8601 date string
    repeat_type: "weekly",                        // Optional: "none"|"daily"|"weekly"|"monthly"|"yearly"
    repeat_interval: 1                            // Optional: integer >= 1
  }, null, 2));
  
  console.log('\n🚨 Common Frontend Mistakes:');
  console.log('❌ Wrong field names: reminderTime → reminder_time');
  console.log('❌ Wrong field names: repeatType → repeat_type');
  console.log('❌ Wrong field names: repeatInterval → repeat_interval');
  console.log('❌ Invalid date format: "2025-12-25 14:30" → "2025-12-25T14:30:00.000Z"');
  console.log('❌ Invalid repeat_type: "every week" → "weekly"');
  console.log('❌ Missing title field');
}

runValidationTests().catch(console.error);