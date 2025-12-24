# Frontend Connection Debug Guide

## ✅ Backend Status: ONLINE
Your backend at `https://ai-assistant-backend-oqpp.onrender.com` is fully operational.

## 🔍 Common Issues & Solutions

### 1. 401 Unauthorized - Authentication Problem

**Cause:** Missing or invalid JWT token
**Solutions:**
```javascript
// Make sure you're including the token in requests
const token = localStorage.getItem('token'); // or however you store it
const response = await fetch('/api/tasks', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

**Debug Steps:**
1. Check if token exists: `console.log(localStorage.getItem('token'))`
2. Verify token format: Should start with `eyJ`
3. Test login first: `POST /api/auth/login`

### 2. 404 Not Found - Endpoint Issues

**Cause:** Incorrect URL construction
**Solutions:**
```javascript
// ❌ Wrong
const url = 'ai-assistant-backend-oqpp.onrender.com/api/tasks';

// ✅ Correct
const url = 'https://ai-assistant-backend-oqpp.onrender.com/api/tasks';
```

### 3. CORS Errors

**Cause:** Frontend domain not in allowed origins
**Current CORS Config:** Backend allows all origins in development, specific domains in production

**Solutions:**
1. **Check your frontend URL** - What domain is your frontend running on?
2. **Add your domain** - If it's a custom domain, we need to add it to CORS config

**Supported Domains:**
- `localhost:3000`, `localhost:5173`, `localhost:8080`
- `*.vercel.app`, `*.netlify.app`, `*.onrender.com`
- `*.github.io`, `*.surge.sh`, `*.firebase.app`

### 4. Network Errors

**Cause:** Connection timeout or DNS issues
**Solutions:**
1. Check internet connection
2. Try direct URL in browser: `https://ai-assistant-backend-oqpp.onrender.com/health`
3. Increase request timeout in your frontend

## 🧪 Frontend Test Script

Add this to your frontend to test connectivity:

```javascript
// Frontend Connection Test
async function testBackendConnection() {
  const baseURL = 'https://ai-assistant-backend-oqpp.onrender.com';
  
  console.log('🔍 Testing backend connection...');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const health = await fetch(`${baseURL}/health`);
    console.log('✅ Health:', await health.json());
    
    // Test 2: API status
    console.log('2. Testing API status...');
    const apiStatus = await fetch(`${baseURL}/api/status`);
    console.log('✅ API Status:', await apiStatus.json());
    
    // Test 3: Auth status
    console.log('3. Testing auth status...');
    const authStatus = await fetch(`${baseURL}/api/auth/status`);
    console.log('✅ Auth Status:', await authStatus.json());
    
    // Test 4: CORS preflight
    console.log('4. Testing CORS...');
    const corsTest = await fetch(`${baseURL}/api/`, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'GET'
      }
    });
    console.log('✅ CORS:', corsTest.status === 200 ? 'OK' : 'Failed');
    
    console.log('🎉 All tests passed! Backend is reachable.');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    console.log('🔧 Troubleshooting:');
    console.log('- Check your internet connection');
    console.log('- Verify the backend URL');
    console.log('- Check browser console for CORS errors');
  }
}

// Run the test
testBackendConnection();
```

## 🔧 Quick Fixes

### Fix 1: Update Your API Base URL
```javascript
// Make sure your frontend uses HTTPS
const API_BASE_URL = 'https://ai-assistant-backend-oqpp.onrender.com';
```

### Fix 2: Add Proper Headers
```javascript
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// For authenticated requests
const authHeaders = {
  ...defaultHeaders,
  'Authorization': `Bearer ${token}`
};
```

### Fix 3: Handle Errors Properly
```javascript
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`${response.status}: ${error.message || 'Request failed'}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}
```

## 📋 Checklist

- [ ] Backend URL includes `https://`
- [ ] JWT token is included in Authorization header
- [ ] Content-Type header is set to `application/json`
- [ ] Frontend domain is supported by CORS
- [ ] Network connection is stable
- [ ] Browser allows cross-origin requests

## 🆘 Still Having Issues?

1. **Share your frontend domain** - What URL is your frontend running on?
2. **Share error logs** - Copy the exact error messages from browser console
3. **Test the script above** - Run the connection test and share results

The backend is confirmed working - let's get your frontend connected! 🚀