// Debug database tables and RLS issues
// Run with: node debug-database-tables.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function debugDatabase() {
  console.log('🔍 Debugging Database Issues');
  console.log('=' .repeat(50));
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`SUPABASE_SERVICE_KEY: ${process.env.SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log('');
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.log('❌ Missing Supabase credentials');
    return;
  }
  
  // Create Supabase client with service key (bypasses RLS)
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
  
  console.log('🔗 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
      
    if (connectionError) {
      console.log('❌ Connection failed:', connectionError.message);
      return;
    }
    
    console.log('✅ Connection successful');
    console.log('');
    
    // Check if new feature tables exist
    console.log('📊 Checking database tables...');
    
    const tablesToCheck = ['tasks', 'reminders', 'document_summaries'];
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
          
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`✅ Table '${table}': exists and accessible`);
        }
      } catch (e) {
        console.log(`❌ Table '${table}': ${e.message}`);
      }
    }
    
    console.log('');
    
    // Test creating a test user and records
    console.log('🧪 Testing record creation...');
    
    // Create test user
    const testUserId = '00000000-0000-0000-0000-000000000001';
    
    try {
      // Test task creation
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .insert({
          user_id: testUserId,
          title: 'Test Task',
          description: 'Testing task creation',
          status: 'pending',
          priority: 'medium'
        })
        .select()
        .single();
        
      if (taskError) {
        console.log('❌ Task creation failed:', taskError.message);
      } else {
        console.log('✅ Task creation successful');
        
        // Clean up
        await supabase.from('tasks').delete().eq('id', taskData.id);
      }
    } catch (e) {
      console.log('❌ Task creation error:', e.message);
    }
    
    try {
      // Test reminder creation
      const { data: reminderData, error: reminderError } = await supabase
        .from('reminders')
        .insert({
          user_id: testUserId,
          title: 'Test Reminder',
          description: 'Testing reminder creation',
          reminder_time: new Date().toISOString(),
          repeat_type: 'none',
          repeat_interval: 1
        })
        .select()
        .single();
        
      if (reminderError) {
        console.log('❌ Reminder creation failed:', reminderError.message);
      } else {
        console.log('✅ Reminder creation successful');
        
        // Clean up
        await supabase.from('reminders').delete().eq('id', reminderData.id);
      }
    } catch (e) {
      console.log('❌ Reminder creation error:', e.message);
    }
    
    try {
      // Test document summary creation
      const { data: docData, error: docError } = await supabase
        .from('document_summaries')
        .insert({
          user_id: testUserId,
          filename: 'test.txt',
          summary: 'Test summary',
          key_points: ['Point 1', 'Point 2'],
          word_count: 100,
          file_type: 'text/plain'
        })
        .select()
        .single();
        
      if (docError) {
        console.log('❌ Document summary creation failed:', docError.message);
      } else {
        console.log('✅ Document summary creation successful');
        
        // Clean up
        await supabase.from('document_summaries').delete().eq('id', docData.id);
      }
    } catch (e) {
      console.log('❌ Document summary creation error:', e.message);
    }
    
    console.log('');
    console.log('🎯 Diagnosis Complete!');
    
  } catch (error) {
    console.error('❌ Database debug failed:', error);
  }
}

debugDatabase().catch(console.error);