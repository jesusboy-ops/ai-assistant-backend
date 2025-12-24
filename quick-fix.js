#!/usr/bin/env node

/**
 * Quick fix script for common backend issues
 * Run with: node quick-fix.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Quick Fix for Backend Issues\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found');
  console.log('💡 Fix: Copy .env.example to .env and update with your credentials');
  console.log('   cp .env.example .env\n');
} else {
  console.log('✅ .env file exists\n');
}

// Load environment variables
require('dotenv').config();

// Check critical environment variables
const criticalVars = {
  'SUPABASE_URL': process.env.SUPABASE_URL,
  'SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY': process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY,
  'JWT_SECRET': process.env.JWT_SECRET,
  'OPENAI_API_KEY': process.env.OPENAI_API_KEY
};

console.log('🔍 Checking critical environment variables:');
let missingVars = 0;

Object.entries(criticalVars).forEach(([name, value]) => {
  if (value) {
    console.log(`✅ ${name}: configured`);
  } else {
    console.log(`❌ ${name}: missing`);
    missingVars++;
  }
});

if (missingVars > 0) {
  console.log(`\n💡 Fix: Add missing variables to your .env file`);
  console.log('   See .env.example for the required format\n');
}

// Check optional services
console.log('\n🔍 Checking optional services:');

if (process.env.REDIS_URL) {
  console.log('✅ Redis: configured');
} else {
  console.log('⚠️  Redis: not configured (will run without caching)');
}

if (process.env.SENDGRID_API_KEY) {
  console.log('✅ SendGrid: configured');
} else {
  console.log('⚠️  SendGrid: not configured (email features disabled)');
}

if (process.env.CLOUDINARY_CLOUD_NAME) {
  console.log('✅ Cloudinary: configured');
} else {
  console.log('⚠️  Cloudinary: not configured (will use Supabase storage)');
}

// Common fixes
console.log('\n🛠️  Common Fixes:');

console.log('\n1. Redis Connection Issues:');
console.log('   - Install Redis: brew install redis (Mac) or apt install redis (Ubuntu)');
console.log('   - Start Redis: redis-server');
console.log('   - Or disable Redis: add DISABLE_REDIS=true to .env');

console.log('\n2. Supabase Connection Issues:');
console.log('   - Check SUPABASE_URL format: https://your-project.supabase.co');
console.log('   - Use service role key for SUPABASE_SERVICE_KEY');
console.log('   - Ensure database schema is created (run database/schema.sql)');

console.log('\n3. CORS Issues:');
console.log('   - Add your frontend URL to CLIENT_URL in .env');
console.log('   - Example: CLIENT_URL=http://localhost:3000');

console.log('\n4. Port Issues:');
console.log('   - Change port: PORT=5001 in .env');
console.log('   - Kill existing processes: pkill -f node');

console.log('\n5. File Upload Issues:');
console.log('   - Check file size (max 50MB)');
console.log('   - Ensure Supabase storage bucket "files" exists');

// Generate JWT secret if missing
if (!process.env.JWT_SECRET) {
  const crypto = require('crypto');
  const jwtSecret = crypto.randomBytes(64).toString('hex');
  console.log('\n🔑 Generated JWT Secret (add to .env):');
  console.log(`JWT_SECRET=${jwtSecret}`);
}

console.log('\n🚀 Quick Start Commands:');
console.log('1. Install dependencies: npm install');
console.log('2. Start development server: npm run dev');
console.log('3. Test endpoints: npm run test-endpoints');
console.log('4. Check health: curl http://localhost:5000/health');

console.log('\n📚 Documentation:');
console.log('- Setup Guide: QUICKSTART.md');
console.log('- Frontend Issues: FRONTEND_CONNECTIVITY_GUIDE.md');
console.log('- API Examples: API_EXAMPLES.md');
console.log('- Troubleshooting: TROUBLESHOOTING.md');

if (missingVars === 0) {
  console.log('\n🎉 Configuration looks good! Try starting the server with: npm run dev');
} else {
  console.log('\n⚠️  Please fix the missing environment variables before starting the server');
}