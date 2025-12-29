require('dotenv').config();
const { supabase } = require('./src/config/supabase');

async function setupProduction() {
  console.log('🚀 Setting up Production Environment...\n');

  try {
    // 1. Test database connection
    console.log('1. Testing database connection...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (userError) {
      console.log('❌ Database connection failed:', userError.message);
      return;
    }
    console.log('✅ Database connection successful');

    // 2. Check if tasks table exists
    console.log('\n2. Checking tasks table...');
    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .limit(1);

    if (taskError) {
      console.log('❌ Tasks table not found:', taskError.message);
      console.log('📝 Please run the main database schema first');
      return;
    }
    console.log('✅ Tasks table exists and working');

    // 3. Check if reminders table exists
    console.log('\n3. Checking reminders table...');
    const { data: reminders, error: reminderError } = await supabase
      .from('reminders')
      .select('*')
      .limit(1);

    if (reminderError) {
      console.log('❌ Reminders table not found:', reminderError.message);
      return;
    }
    console.log('✅ Reminders table exists and working');

    // 4. Check if life_obligations table exists
    console.log('\n4. Checking life_obligations table...');
    const { data: obligations, error: obligationError } = await supabase
      .from('life_obligations')
      .select('*')
      .limit(1);

    if (obligationError) {
      console.log('❌ Life obligations table not found:', obligationError.message);
      console.log('\n📝 REQUIRED: Create the life_obligations table');
      console.log('Copy and paste this SQL into your Supabase SQL Editor:');
      console.log('=' .repeat(60));
      console.log(`
-- Life obligations table for Life Admin Manager
CREATE TABLE IF NOT EXISTS life_obligations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'other' CHECK (category IN ('education', 'finance', 'work', 'personal', 'health', 'other')),
    type VARCHAR(20) DEFAULT 'one_time' CHECK (type IN ('one_time', 'recurring')),
    frequency VARCHAR(20) CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    consequence TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'overdue')),
    risk_level VARCHAR(10) DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
    last_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_life_obligations_user_id ON life_obligations(user_id);
CREATE INDEX IF NOT EXISTS idx_life_obligations_due_date ON life_obligations(due_date);
CREATE INDEX IF NOT EXISTS idx_life_obligations_status ON life_obligations(status);
CREATE INDEX IF NOT EXISTS idx_life_obligations_type ON life_obligations(type);

-- Enable Row Level Security (RLS)
ALTER TABLE life_obligations ENABLE ROW LEVEL SECURITY;

-- RLS Policy (users can only access their own data)
CREATE POLICY "Users can manage own life obligations" ON life_obligations FOR ALL USING (user_id = auth.uid());
      `);
      console.log('=' .repeat(60));
      console.log('\nAfter running the SQL, run this script again to verify.');
      return;
    }
    console.log('✅ Life obligations table exists and working');

    // 5. Test API endpoints
    console.log('\n5. Testing API endpoints...');
    
    // Test health endpoint
    try {
      const healthResponse = await fetch('http://localhost:5000/health');
      if (healthResponse.ok) {
        console.log('✅ Health endpoint working');
      } else {
        console.log('⚠️  Health endpoint not responding (server may not be running)');
      }
    } catch (error) {
      console.log('⚠️  Server not running on localhost:5000');
    }

    // 6. Environment check
    console.log('\n6. Checking environment variables...');
    const requiredVars = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_KEY', 
      'OPENAI_API_KEY',
      'JWT_SECRET'
    ];

    let missingVars = [];
    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    });

    if (missingVars.length > 0) {
      console.log('❌ Missing environment variables:');
      missingVars.forEach(varName => {
        console.log(`   - ${varName}`);
      });
    } else {
      console.log('✅ All required environment variables set');
    }

    // 7. Final status
    console.log('\n' + '='.repeat(50));
    if (obligationError || missingVars.length > 0) {
      console.log('❌ Setup incomplete - please fix the issues above');
    } else {
      console.log('🎉 Production setup complete!');
      console.log('\n✅ All database tables ready');
      console.log('✅ All services configured');
      console.log('✅ Environment variables set');
      console.log('\n🚀 Ready for production use!');
      
      console.log('\n📋 Available endpoints:');
      console.log('- Tasks: /api/tasks');
      console.log('- Reminders: /api/reminders');
      console.log('- Life Admin: /api/life-admin/obligations');
      console.log('- Email: /api/email');
      console.log('- Calendar: /api/calendar');
      console.log('- Notes: /api/notes');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupProduction();