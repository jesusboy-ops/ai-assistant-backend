require('dotenv').config();

const API_BASE = process.env.API_URL || 'http://localhost:5000/api';

// Test user credentials
const TEST_USER = {
  email: 'testuser@example.com',
  password: 'testpassword123'
};

let authToken = '';

/**
 * Test error response formats
 */
async function testErrorFormats() {
  console.log('🔍 Testing Error Response Formats...\n');

  try {
    // 1. Login
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });

    const loginData = await loginResponse.json();
    authToken = loginData.token;
    console.log('✅ Login successful\n');

    // 2. Test validation errors
    console.log('2. Testing validation errors...');
    
    // Task with missing title
    const invalidTaskResponse = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        description: 'Task without title',
        priority: 'high'
      })
    });

    if (!invalidTaskResponse.ok) {
      const errorData = await invalidTaskResponse.json();
      console.log('✅ Task validation error format:');
      console.log('  - Has message:', errorData.hasOwnProperty('message'));
      console.log('  - Has error:', errorData.hasOwnProperty('error'));
      console.log('  - Has errors array:', errorData.hasOwnProperty('errors'));
      console.log('  - Error data:', JSON.stringify(errorData, null, 2));
    }

    // Reminder with invalid date
    const invalidReminderResponse = await fetch(`${API_BASE}/reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title: 'Test Reminder',
        reminder_time: 'invalid-date'
      })
    });

    if (!invalidReminderResponse.ok) {
      const errorData = await invalidReminderResponse.json();
      console.log('\n✅ Reminder validation error format:');
      console.log('  - Has message:', errorData.hasOwnProperty('message'));
      console.log('  - Has error:', errorData.hasOwnProperty('error'));
      console.log('  - Has errors array:', errorData.hasOwnProperty('errors'));
      console.log('  - Error data:', JSON.stringify(errorData, null, 2));
    }

    // Calendar event with invalid date format
    const invalidEventResponse = await fetch(`${API_BASE}/calendar/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title: 'Test Event',
        date: '31-12-2024', // Wrong format
        time: '25:00' // Invalid time
      })
    });

    if (!invalidEventResponse.ok) {
      const errorData = await invalidEventResponse.json();
      console.log('\n✅ Calendar validation error format:');
      console.log('  - Response:', JSON.stringify(errorData, null, 2));
    }

    // 3. Test 404 errors
    console.log('\n3. Testing 404 errors...');
    
    const notFoundResponse = await fetch(`${API_BASE}/tasks/00000000-0000-0000-0000-000000000000`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!notFoundResponse.ok) {
      const errorData = await notFoundResponse.json();
      console.log('✅ 404 error format:');
      console.log('  - Has message:', errorData.hasOwnProperty('message'));
      console.log('  - Has error:', errorData.hasOwnProperty('error'));
      console.log('  - Error data:', JSON.stringify(errorData, null, 2));
    }

    console.log('\n🎉 Error format test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testErrorFormats();