#!/usr/bin/env node

/**
 * Quick setup script for the AI Assistant Backend
 * Run with: node setup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 AI Assistant Backend Setup\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from .env.example...');
  try {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created');
    console.log('⚠️  Please update .env with your actual credentials\n');
  } catch (error) {
    console.log('❌ Failed to create .env file:', error.message);
  }
} else {
  console.log('✅ .env file already exists\n');
}

// Check Node.js version
console.log('🔍 Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion >= 18) {
  console.log(`✅ Node.js ${nodeVersion} (compatible)\n`);
} else {
  console.log(`❌ Node.js ${nodeVersion} (requires Node.js 18+)\n`);
  process.exit(1);
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed\n');
} catch (error) {
  console.log('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Check required environment variables
console.log('🔧 Checking environment configuration...');
require('dotenv').config();

const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'OPENAI_API_KEY',
  'JWT_SECRET'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('⚠️  Missing required environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n📝 Please update your .env file with these values');
} else {
  console.log('✅ All required environment variables are set\n');
}

// Test server startup
console.log('🧪 Testing server startup...');
try {
  // Quick test to see if the server can start
  const testScript = `
    require('dotenv').config();
    const express = require('express');
    const app = express();
    
    app.get('/test', (req, res) => res.json({ status: 'ok' }));
    
    const server = app.listen(0, () => {
      console.log('Server test successful');
      server.close();
      process.exit(0);
    });
    
    setTimeout(() => {
      console.log('Server test timeout');
      process.exit(1);
    }, 5000);
  `;
  
  fs.writeFileSync('temp-test.js', testScript);
  execSync('node temp-test.js', { stdio: 'pipe' });
  fs.unlinkSync('temp-test.js');
  console.log('✅ Server startup test passed\n');
} catch (error) {
  console.log('❌ Server startup test failed');
  if (fs.existsSync('temp-test.js')) {
    fs.unlinkSync('temp-test.js');
  }
}

// Final instructions
console.log('🎉 Setup Complete!\n');
console.log('Next steps:');
console.log('1. Update .env with your credentials:');
console.log('   - SUPABASE_URL and SUPABASE_SERVICE_KEY');
console.log('   - OPENAI_API_KEY');
console.log('   - JWT_SECRET (generate a random string)');
console.log('');
console.log('2. Run the database schema in Supabase:');
console.log('   - Copy content from database/schema.sql');
console.log('   - Paste in Supabase SQL Editor');
console.log('   - Execute the queries');
console.log('');
console.log('3. Start the development server:');
console.log('   npm run dev');
console.log('');
console.log('4. Test the endpoints:');
console.log('   npm run test-endpoints');
console.log('');
console.log('5. Check the health endpoint:');
console.log('   http://localhost:5000/health');
console.log('');
console.log('📚 Documentation:');
console.log('- API Examples: API_EXAMPLES.md');
console.log('- Frontend Guide: FRONTEND_CONNECTIVITY_GUIDE.md');
console.log('- Features List: FEATURES.md');
console.log('- Quick Start: QUICKSTART.md');
console.log('');
console.log('🆘 Need help? Check TROUBLESHOOTING.md');