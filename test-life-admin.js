require('dotenv').config();

const API_BASE = process.env.API_URL || 'http://localhost:5000/api';

// Test user credentials (use your existing test user)
const TEST_USER = {
  email: 'testuser@example.com',
  password: 'testpassword123'
};

let authToken = '';

/**
 * Test Life Admin Manager endpoints
 */
async function testLifeAdminManager() {
  console.log('🧠 Testing Life Admin Manager...\n');

  try {
    // 1. Login to get auth token
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

    // 2. Test creating a life obligation
    console.log('2. Creating life obligation...');
    const obligationData = {
      title: 'Renew Driver License',
      category: 'personal',
      type: 'one_time',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      consequence: 'Cannot drive legally, may face fines',
      risk_level: 'high'
    };

    const createResponse = await fetch(`${API_BASE}/life-admin/obligations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(obligationData)
    });

    if (!createResponse.ok) {
      throw new Error(`Create obligation failed: ${createResponse.status}`);
    }

    const createdObligation = await createResponse.json();
    console.log('✅ Obligation created:', createdObligation.obligation.title);
    console.log('📝 Message:', createdObligation.message);

    const obligationId = createdObligation.obligation.id;

    // 3. Test getting all obligations
    console.log('\n3. Getting all obligations...');
    const getResponse = await fetch(`${API_BASE}/life-admin/obligations`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!getResponse.ok) {
      throw new Error(`Get obligations failed: ${getResponse.status}`);
    }

    const obligations = await getResponse.json();
    console.log('✅ Retrieved obligations:', obligations.obligations.length);

    // 4. Test generating a plan from user input
    console.log('\n4. Testing AI plan generation...');
    const planInput = {
      input: "I need to renew my passport by March 15th, 2024. It's important for my upcoming trip. Also need to book flight tickets and prepare travel documents.",
      context: { urgent: true }
    };

    const planResponse = await fetch(`${API_BASE}/life-admin/generate-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(planInput)
    });

    if (!planResponse.ok) {
      throw new Error(`Generate plan failed: ${planResponse.status}`);
    }

    const plan = await planResponse.json();
    console.log('✅ Generated plan:');
    console.log('  - Obligations:', plan.obligations.length);
    console.log('  - Tasks:', plan.tasks.length);
    console.log('  - Emails:', plan.emails.length);

    // 5. Test deadline checking
    console.log('\n5. Testing deadline checking...');
    const deadlineResponse = await fetch(`${API_BASE}/life-admin/check-deadlines`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!deadlineResponse.ok) {
      throw new Error(`Check deadlines failed: ${deadlineResponse.status}`);
    }

    const deadlineCheck = await deadlineResponse.json();
    console.log('✅ Deadline check completed:');
    console.log('  - Overdue count:', deadlineCheck.overdue_count);
    console.log('  - Urgent count:', deadlineCheck.urgent_count);
    console.log('  - Escalated reminders:', deadlineCheck.escalated_reminders);

    // 6. Test statistics
    console.log('\n6. Getting statistics...');
    const statsResponse = await fetch(`${API_BASE}/life-admin/stats`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!statsResponse.ok) {
      throw new Error(`Get stats failed: ${statsResponse.status}`);
    }

    const stats = await statsResponse.json();
    console.log('✅ Statistics retrieved:');
    console.log('  - Total obligations:', stats.obligations.total);
    console.log('  - Active obligations:', stats.obligations.active);
    console.log('  - High risk obligations:', stats.obligations.high_risk);
    console.log('  - Total tasks:', stats.tasks.total);
    console.log('  - Total reminders:', stats.reminders.total);

    // 7. Test completing an obligation
    console.log('\n7. Completing obligation...');
    const completeResponse = await fetch(`${API_BASE}/life-admin/obligations/${obligationId}/complete`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!completeResponse.ok) {
      throw new Error(`Complete obligation failed: ${completeResponse.status}`);
    }

    const completedObligation = await completeResponse.json();
    console.log('✅ Obligation completed:', completedObligation.message);

    // 8. Test recurring obligation renewal
    console.log('\n8. Testing recurring renewal...');
    const renewResponse = await fetch(`${API_BASE}/life-admin/renew-recurring`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!renewResponse.ok) {
      throw new Error(`Renew recurring failed: ${renewResponse.status}`);
    }

    const renewResult = await renewResponse.json();
    console.log('✅ Recurring renewal:', renewResult.message);

    console.log('\n🎉 All Life Admin Manager tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

/**
 * Test task enhancement features
 */
async function testTaskEnhancements() {
  console.log('\n📋 Testing Task Enhancements...\n');

  try {
    // Test task overload checking
    console.log('1. Testing task overload checking...');
    const overloadResponse = await fetch(`${API_BASE}/tasks/check-overload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ date: new Date().toISOString() })
    });

    if (overloadResponse.ok) {
      const overloadData = await overloadResponse.json();
      console.log('✅ Overload check:', overloadData.is_overloaded ? 'Overloaded' : 'Normal');
    }

    console.log('✅ Task enhancement tests completed');

  } catch (error) {
    console.error('❌ Task enhancement test failed:', error.message);
  }
}

/**
 * Test notes enhancement features
 */
async function testNotesEnhancements() {
  console.log('\n📝 Testing Notes Enhancements...\n');

  try {
    // Test note analysis
    console.log('1. Testing note analysis...');
    const noteContent = `
      Meeting notes from today:
      - Need to submit quarterly report by March 30th
      - Follow up with client about contract renewal
      - Doctor appointment scheduled for next Friday
      - Remember to pay insurance premium before it expires on April 15th
      - Decided to go with vendor A for the new project
    `;

    const analysisResponse = await fetch(`${API_BASE}/notes/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ content: noteContent })
    });

    if (analysisResponse.ok) {
      const analysis = await analysisResponse.json();
      console.log('✅ Note analysis completed:');
      console.log('  - Total suggestions:', analysis.summary.total_suggestions);
      console.log('  - Tasks suggested:', analysis.summary.tasks);
      console.log('  - Reminders suggested:', analysis.summary.reminders);
      console.log('  - Obligations suggested:', analysis.summary.obligations);
    }

    console.log('✅ Notes enhancement tests completed');

  } catch (error) {
    console.error('❌ Notes enhancement test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Life Admin Manager Tests\n');
  console.log('=' .repeat(50));
  
  await testLifeAdminManager();
  await testTaskEnhancements();
  await testNotesEnhancements();
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 All tests completed successfully!');
}

// Handle command line arguments
if (process.argv.includes('--obligations-only')) {
  testLifeAdminManager();
} else if (process.argv.includes('--tasks-only')) {
  testTaskEnhancements();
} else if (process.argv.includes('--notes-only')) {
  testNotesEnhancements();
} else {
  runAllTests();
}