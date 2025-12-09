const webpush = require('web-push');
const fs = require('fs').promises;
const path = require('path');

async function initializeVapidKeys() {
  try {
    // Check if VAPID keys exist in environment
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        `mailto:${process.env.EMAIL_FROM || 'noreply@example.com'}`,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
      console.log('✅ VAPID keys loaded from environment');
      return;
    }

    // Generate new VAPID keys
    console.log('⚠️  VAPID keys not found, generating new ones...');
    const vapidKeys = webpush.generateVAPIDKeys();
    
    // Save to .env file
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    try {
      envContent = await fs.readFile(envPath, 'utf8');
    } catch (error) {
      // .env doesn't exist, create new content
      envContent = '';
    }

    // Update or append VAPID keys
    if (envContent.includes('VAPID_PUBLIC_KEY=')) {
      envContent = envContent.replace(/VAPID_PUBLIC_KEY=.*/, `VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
      envContent = envContent.replace(/VAPID_PRIVATE_KEY=.*/, `VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
    } else {
      envContent += `\n# Auto-generated VAPID keys\nVAPID_PUBLIC_KEY=${vapidKeys.publicKey}\nVAPID_PRIVATE_KEY=${vapidKeys.privateKey}\n`;
    }

    await fs.writeFile(envPath, envContent);
    
    // Set in current process
    process.env.VAPID_PUBLIC_KEY = vapidKeys.publicKey;
    process.env.VAPID_PRIVATE_KEY = vapidKeys.privateKey;

    webpush.setVapidDetails(
      `mailto:${process.env.EMAIL_FROM || 'noreply@example.com'}`,
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );

    console.log('✅ VAPID keys generated and saved to .env');
    console.log('📋 Public Key:', vapidKeys.publicKey);
  } catch (error) {
    console.error('Failed to initialize VAPID keys:', error);
    throw error;
  }
}

module.exports = { initializeVapidKeys };
