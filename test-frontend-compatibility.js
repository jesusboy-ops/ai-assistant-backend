require('dotenv').config();

const API_BASE = process.env.API_URL || 'http://localhost:5000/api';

// Test user credentials
const TEST_USER = {
  email: 'testuser@example.com',
  password: 'testpassword123'
};

let authToken = '';

/**
 * Test all endpoints with exact frontend data formats
 */
async function testFrontendCompatibility() {
  console.log('🔍 Testing Frontend Compatibility...\n');

  try {
    // 1. Login
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    authToken = loginData.token;
    console.log('✅ Login successful\n');

    // 2. Test Tasks API
    console.log('2. Testing Tasks API...');
    
    // Create task with frontend format
    const taskData = {
      title: 'Frontend Test Task',
      description: 'Testing frontend compatibility',
      priority: 'high',
      status: 'pending',
      dueDate: '2024-12-31' // YYYY-MM-DD format
    };

    const createTaskResponse = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(taskData)
    });

    if (!createTaskResponse.ok) {
      const errorText = await createTaskResponse.text();
      console.log('❌ Task creation failed:', createTaskResponse.status, errorText);
    } else {
      const createdTask = await createTaskResponse.json();
      console.log('✅ Task created with frontend format:');
      console.log('  - ID:', createdTask.id);
      console.log('  - Title:', createdTask.title);
      console.log('  - DueDate:', createdTask.dueDate);
      console.log('  - Priority:', createdTask.priority);

      // Get tasks
      const getTasksResponse = await fetch(`${API_BASE}/tasks`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (getTasksResponse.ok) {
        const tasks = await getTasksResponse.json();
        console.log('✅ Tasks retrieved as array:', Array.isArray(tasks));
        console.log('  - Count:', tasks.length);
        if (tasks.length > 0) {
          console.log('  - First task format correct:', 
            tasks[0].hasOwnProperty('id') && 
            tasks[0].hasOwnProperty('title') && 
            tasks[0].hasOwnProperty('dueDate'));
        }
      }
    }

    // 3. Test Reminders API
    console.log('\n3. Testing Reminders API...');
    
    const reminderData = {
      title: 'Frontend Test Reminder',
      description: 'Testing frontend compatibility',
      reminder_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      reminder_type: 'general',
      priority: 'medium'
    };

    const createReminderResponse = await fetch(`${API_BASE}/reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(reminderData)
    });

    if (!createReminderResponse.ok) {
      const errorText = await createReminderResponse.text();
      console.log('❌ Reminder creation failed:', createReminderResponse.status, errorText);
    } else {
      const createdReminder = await createReminderResponse.json();
      console.log('✅ Reminder created with frontend format:');
      console.log('  - ID:', createdReminder.id);
      console.log('  - Title:', createdReminder.title);
      console.log('  - Reminder Type:', createdReminder.reminder_type);
      console.log('  - Priority:', createdReminder.priority);

      // Get reminders
      const getRemindersResponse = await fetch(`${API_BASE}/reminders`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (getRemindersResponse.ok) {
        const reminders = await getRemindersResponse.json();
        console.log('✅ Reminders retrieved as array:', Array.isArray(reminders));
        console.log('  - Count:', reminders.length);
        if (reminders.length > 0) {
          console.log('  - First reminder format correct:', 
            reminders[0].hasOwnProperty('id') && 
            reminders[0].hasOwnProperty('reminder_time') && 
            reminders[0].hasOwnProperty('reminder_type'));
        }
      }
    }

    // 4. Test Calendar API
    console.log('\n4. Testing Calendar API...');
    
    const eventData = {
      title: 'Frontend Test Event',
      description: 'Testing frontend compatibility',
      date: '2024-12-31', // YYYY-MM-DD format
      time: '14:30', // HH:MM format
      duration: 90, // minutes
      color: '#ff6b6b',
      location: 'Test Location'
    };

    const createEventResponse = await fetch(`${API_BASE}/calendar/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(eventData)
    });

    if (!createEventResponse.ok) {
      const errorText = await createEventResponse.text();
      console.log('❌ Calendar event creation failed:', createEventResponse.status, errorText);
    } else {
      const createdEvent = await createEventResponse.json();
      console.log('✅ Calendar event created with frontend format:');
      console.log('  - ID:', createdEvent.id);
      console.log('  - Title:', createdEvent.title);
      console.log('  - Date:', createdEvent.date);
      console.log('  - Time:', createdEvent.time);
      console.log('  - Duration:', createdEvent.duration);
      console.log('  - Color:', createdEvent.color);

      // Get events
      const getEventsResponse = await fetch(`${API_BASE}/calendar/events`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (getEventsResponse.ok) {
        const events = await getEventsResponse.json();
        console.log('✅ Calendar events retrieved as array:', Array.isArray(events));
        console.log('  - Count:', events.length);
        if (events.length > 0) {
          console.log('  - First event format correct:', 
            events[0].hasOwnProperty('id') && 
            events[0].hasOwnProperty('date') && 
            events[0].hasOwnProperty('time') &&
            events[0].hasOwnProperty('duration'));
        }
      }
    }

    console.log('\n🎉 Frontend compatibility test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFrontendCompatibility();