const { createClient } = require('@supabase/supabase-js');

// Validate environment variables
if (!process.env.SUPABASE_URL) {
  console.error('❌ SUPABASE_URL is required in environment variables');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_KEY && !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY is required in environment variables');
  process.exit(1);
}

// Use service key if available, otherwise use anon key
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('🔗 Initializing Supabase client...');

let supabase;
let isSupabaseAvailable = false;

try {
  supabase = createClient(
    process.env.SUPABASE_URL,
    supabaseKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': 'ai-assistant-backend'
        }
      }
    }
  );
} catch (error) {
  console.error('❌ Failed to create Supabase client:', error.message);
  // Use mock client
  const { supabase: mockSupabase } = require('./supabase-mock');
  supabase = mockSupabase;
}

// Test connection with better error handling
const testConnection = async () => {
  try {
    // Simple test - try to access users table
    const { data, error } = await Promise.race([
      supabase.from('users').select('count').limit(1),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      )
    ]);
    
    if (error) {
      // If users table doesn't exist, that's expected for new projects
      if (error.message.includes('relation "public.users" does not exist')) {
        console.log('✅ Supabase connection successful (database schema needs to be created)');
        console.log('💡 Run the SQL from database/schema.sql in your Supabase SQL Editor');
        isSupabaseAvailable = true;
      } else {
        console.warn('⚠️  Supabase connection test failed:', error.message);
        console.warn('⚠️  Using mock database - some features will be limited');
        isSupabaseAvailable = false;
      }
    } else {
      console.log('✅ Supabase connection successful');
      isSupabaseAvailable = true;
    }
  } catch (err) {
    console.warn('⚠️  Supabase connection test error (using mock database):', err.message);
    isSupabaseAvailable = false;
    
    // Switch to mock client if connection fails
    const { supabase: mockSupabase } = require('./supabase-mock');
    supabase = mockSupabase;
  }
};

// Test connection on startup (non-blocking)
setTimeout(testConnection, 1000);

const getSupabaseStatus = () => isSupabaseAvailable;

module.exports = { supabase, getSupabaseStatus };
