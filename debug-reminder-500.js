// Debug 500 error in reminder creation
// Run with: node debug-reminder-500.js

require('dotenv').config();
const { supabase } = require('./src/config/supabase');

async function debugReminderCreation() {
  console.log('🔍 Debugging Reminder Creation 500 Error');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Check if reminders table exists
    console.log('1. Checking if reminders table exists...');
    const { data: tables, error: tablesError } = await supabase
      .from('reminders')
      .select('id')
      .limit(1);
    
    if (tablesError) {
      console.log('❌ Reminders table error:', tablesError);
      return;
    }
    console.log('✅ Reminders table exists');
    
    // Test 2: Create a test user first (needed for foreign key)
    console.log('2. Creating test user...');
    const testUser = {
      id: '550e8400-e29b-41d4-a716-446655440000', // Fixed UUID for testing
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedpassword'
    };
    
    // Try to insert test user (might fail if exists, that's ok)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert(testUser, { onConflict: 'id' })
      .select()
      .single();
    
    if (userError) {
      console.log('⚠️  User creation warning:', userError.message);
    } else {
      console.log('✅ Test user ready');
    }
    
    // Test 3: Try to create a reminder
    console.log('3. Testing reminder creation...');
    const reminderData = {
      user_id: testUser.id,
      title: 'Test Reminder',
      description: 'This is a test reminder',
      reminder_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      repeat_type: 'none',
      repeat_interval: 1,
      is_active: true
    };
    
    const { data: reminder, error: reminderError } = await supabase
      .from('reminders')
      .insert(reminderData)
      .select()
      .single();
    
    if (reminderError) {
      console.log('❌ Reminder creation failed:', reminderError);
      console.log('Error details:', JSON.stringify(reminderError, null, 2));
      
      // Check specific error types
      if (reminderError.code === '42501') {
        console.log('🔒 This is a Row Level Security (RLS) error');
        console.log('💡 The issue is that RLS policies require auth.uid() but we\'re using service key');
      }
    } else {
      console.log('✅ Reminder created successfully:', reminder);
      
      // Clean up
      await supabase
        .from('reminders')
        .delete()
        .eq('id', reminder.id);
      console.log('🧹 Test reminder cleaned up');
    }
    
    // Test 4: Check RLS policies
    console.log('4. Checking RLS policies...');
    const { data: policies, error: policyError } = await supabase
      .rpc('get_policies', { table_name: 'reminders' })
      .catch(() => ({ data: null, error: 'RPC not available' }));
    
    if (policyError) {
      console.log('⚠️  Cannot check RLS policies:', policyError);
    } else {
      console.log('📋 RLS policies exist for reminders table');
    }
    
    // Clean up test user
    await supabase
      .from('users')
      .delete()
      .eq('id', testUser.id);
    console.log('🧹 Test user cleaned up');
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
  }
}

debugReminderCreation();