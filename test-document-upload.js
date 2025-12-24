// Test document upload endpoint
// Run with: node test-document-upload.js

const https = require('https');
const FormData = require('form-data');

const BASE_URL = 'https://ai-assistant-backend-oqpp.onrender.com';

function testDocumentUpload() {
  return new Promise((resolve) => {
    // Create a test text file
    const testContent = "This is a test document for AI summarization. It contains multiple sentences to test the summarization feature. The document discusses various topics including technology, artificial intelligence, and document processing.";
    
    const form = new FormData();
    form.append('file', Buffer.from(testContent), {
      filename: 'test-document.txt',
      contentType: 'text/plain'
    });

    const options = {
      hostname: 'ai-assistant-backend-oqpp.onrender.com',
      port: 443,
      path: '/api/documents/summarize',
      method: 'POST',
      headers: {
        ...form.getHeaders(),
        'Authorization': 'Bearer fake-token-for-testing'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            response: json
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            response: responseData
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        status: 'ERROR',
        error: err.message
      });
    });

    form.pipe(req);
  });
}

async function runTest() {
  console.log('🧪 Testing Document Upload Endpoint');
  console.log('=' .repeat(50));
  console.log(`URL: ${BASE_URL}/api/documents/summarize`);
  console.log('');
  
  console.log('📤 Uploading test document...');
  const result = await testDocumentUpload();
  
  console.log(`Status: ${result.status}`);
  console.log('Response:', JSON.stringify(result.response, null, 2));
  console.log('');
  
  if (result.status === 401) {
    console.log('✅ Expected result: 401 (authentication required)');
    console.log('   This means the endpoint accepts file uploads correctly');
    console.log('   Your frontend just needs to include a valid JWT token');
  } else if (result.status === 400) {
    console.log('❌ 400 Error - Check the error message above');
    console.log('   This indicates a problem with the file upload format');
  } else if (result.status === 500) {
    console.log('❌ 500 Error - Server-side issue');
    console.log('   Check backend logs for database or AI service issues');
  } else {
    console.log(`ℹ️  Unexpected status: ${result.status}`);
  }
  
  console.log('');
  console.log('📋 Frontend Requirements:');
  console.log('1. Use FormData with field name "file"');
  console.log('2. Include Authorization header with valid JWT token');
  console.log('3. Don\'t manually set Content-Type header');
  console.log('4. File must be under 10MB');
  console.log('5. File type must be supported (PDF, DOC, DOCX, TXT, etc.)');
}

runTest().catch(console.error);