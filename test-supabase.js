#!/usr/bin/env node

/**
 * Test Supabase connection
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testSupabase() {
  console.log('🧪 Testing Supabase Connection...\n');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`SUPABASE_SERVICE_KEY: ${process.env.SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing'}`);
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.log('\n❌ Missing required Supabase credentials');
    return;
  }
  
  // Create client
  console.log('\n🔗 Creating Supabase client...');
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  // Test 1: Basic connection
  console.log('🧪 Test 1: Basic connection...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log(`❌ Connection failed: ${error.message}`);
      
      // Check if it's a table not found error
      if (error.message.includes('relation "public.users" does not exist')) {
        console.log('💡 The "users" table doesn\'t exist. You need to run the database schema.');
        console.log('   Copy the content from database/schema.sql and run it in Supabase SQL Editor');
      }
    } else {
      console.log('✅ Connection successful!');
      console.log(`📊 Users table accessible`);
    }
  } catch (err) {
    console.log(`❌ Connection error: ${err.message}`);
  }
  
  // Test 2: Check if tables exist
  console.log('\n🧪 Test 2: Checking database tables...');
  try {
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['users', 'conversations', 'messages', 'tasks', 'reminders']);
    
    if (error) {
      console.log(`❌ Cannot check tables: ${error.message}`);
    } else {
      const tableNames = tables.map(t => t.table_name);
      console.log('📋 Found tables:', tableNames.length > 0 ? tableNames.join(', ') : 'None');
      
      const requiredTables = ['users', 'conversations', 'messages', 'tasks', 'reminders'];
      const missingTables = requiredTables.filter(table => !tableNames.includes(table));
      
      if (missingTables.length > 0) {
        console.log('⚠️  Missing tables:', missingTables.join(', '));
        console.log('💡 Run the database schema from database/schema.sql in Supabase SQL Editor');
      } else {
        console.log('✅ All required tables exist');
      }
    }
  } catch (err) {
    console.log(`❌ Table check error: ${err.message}`);
  }
  
  // Test 3: Test insert (if users table exists)
  console.log('\n🧪 Test 3: Testing database operations...');
  try {
    // Try to insert a test user
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: 'test-connection@example.com',
        name: 'Test User',
        password: 'test123',
        email_verified: false
      })
      .select()
      .single();
    
    if (error) {
      if (error.message.includes('duplicate key')) {
        console.log('✅ Database operations work (user already exists)');
      } else {
        console.log(`❌ Insert failed: ${error.message}`);
      }
    } else {
      console.log('✅ Database operations work (test user created)');
      
      // Clean up test user
      await supabase
        .from('users')
        .delete()
        .eq('email', 'test-connection@example.com');
      console.log('🧹 Test user cleaned up');
    }
  } catch (err) {
    console.log(`❌ Database operation error: ${err.message}`);
  }
  
  console.log('\n🎯 Test Complete!');
}

testSupabase().catch(console.error);