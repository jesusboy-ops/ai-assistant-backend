require('dotenv').config();
const { supabase } = require('./src/config/supabase');
const fs = require('fs');

async function updateDatabaseSchema() {
  console.log('🔄 Updating database schema...');
  
  try {
    // Read the schema file
    const schemaSQL = fs.readFileSync('./database/schema.sql', 'utf8');
    
    // Split into individual statements (rough split by semicolon)
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.includes('CREATE TABLE IF NOT EXISTS life_obligations')) {
        console.log(`⏳ Executing statement ${i + 1}: Creating life_obligations table...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql: statement + ';' 
        });
        
        if (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }
    
    // Test if the table was created
    console.log('🧪 Testing life_obligations table...');
    const { data, error } = await supabase
      .from('life_obligations')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Table test failed:', error.message);
      console.log('\n📝 Please run the database schema manually in Supabase SQL Editor:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Open SQL Editor');
      console.log('3. Copy and paste the content from database/schema.sql');
      console.log('4. Execute the queries');
    } else {
      console.log('✅ life_obligations table is working correctly!');
    }
    
  } catch (error) {
    console.error('❌ Schema update failed:', error.message);
    console.log('\n📝 Please run the database schema manually in Supabase SQL Editor:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Open SQL Editor');
    console.log('3. Copy and paste the content from database/schema.sql');
    console.log('4. Execute the queries');
  }
}

updateDatabaseSchema();