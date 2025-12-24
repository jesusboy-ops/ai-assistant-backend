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

const supabase = createClient(
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

// Test connection with better error handling
const testConnection = async () => {
  try {
    // Simple health check that doesn't require specific tables
    const { data, error } = await Promise.race([
      supabase.rpc('version'), // Built-in PostgreSQL function
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      )
    ]);
    
    if (error) {
      // Try alternative test if version() fails
      try {
        const { error: altError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .limit(1);
        
        if (altError) {
          console.warn('⚠️  Supabase connection test failed:', altError.message);
        } else {
          console.log('✅ Supabase connection successful');
        }
      } catch (altErr) {
        console.warn('⚠️  Supabase connection test failed:', error.message);
      }
    } else {
      console.log('✅ Supabase connection successful');
    }
  } catch (err) {
    console.warn('⚠️  Supabase connection test error (continuing anyway):', err.message);
  }
};

// Test connection on startup (non-blocking)
setTimeout(testConnection, 1000);

module.exports = { supabase };
