# CORS Update Guide

## ✅ Good News!

Your backend **already supports** `http://localhost:5173` in the code! The CORS configuration includes:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'http://localhost:5173', // ✅ Already included!
  'http://localhost:4173', // Vite preview
  // ... and more
];
```

## 🔧 What You Need to Do

### Option 1: Update Environment Variable (Recommended)

1. **Go to your Render Dashboard**
2. **Select your service**: `ai-assistant-backend-oqpp`
3. **Go to Environment tab**
4. **Add or update** this variable:
   ```
   CLIENT_URL=http://localhost:5173
   ```
5. **Save changes** - Render will automatically redeploy

### Option 2: Test Without Changes

Since your CORS is already configured for development, you can test immediately:

```javascript
// Your frontend can make requests like this:
fetch('https://ai-assistant-backend-oqpp.onrender.com/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test123',
    name: 'Test User'
  })
});
```

## 🧪 Test CORS Access

### Quick Test from Browser Console

Open your frontend at `http://localhost:5173` and run this in the browser console:

```javascript
fetch('https://ai-assistant-backend-oqpp.onrender.com/health')
  .then(response => response.json())
  .then(data => console.log('✅ CORS working:', data))
  .catch(error => console.error('❌ CORS error:', error));
```

### Test Registration

```javascript
fetch('https://ai-assistant-backend-oqpp.onrender.com/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'frontend-test@example.com',
    password: 'test123456',
    name: 'Frontend Test'
  })
})
.then(response => response.json())
.then(data => {
  console.log('✅ Registration successful:', data);
  // Save the token for future requests
  localStorage.setItem('token', data.token);
})
.catch(error => console.error('❌ Registration error:', error));
```

### Test AI Chat

```javascript
const token = localStorage.getItem('token');

fetch('https://ai-assistant-backend-oqpp.onrender.com/api/chat/message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: 'Hello from my frontend!'
  })
})
.then(response => response.json())
.then(data => {
  console.log('✅ AI Chat working:', data.message);
})
.catch(error => console.error('❌ Chat error:', error));
```

## 🔍 Troubleshooting

### If you get CORS errors:

1. **Check the browser console** for specific error messages
2. **Verify your frontend URL** is exactly `http://localhost:5173`
3. **Update CLIENT_URL** in Render environment variables
4. **Wait for redeploy** (takes ~2-3 minutes)

### Common CORS Error Messages:

**Error:** `Access to fetch at '...' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solution:** Add `CLIENT_URL=http://localhost:5173` to Render environment variables

**Error:** `No 'Access-Control-Allow-Origin' header is present`

**Solution:** Your backend might be down or the URL is incorrect

## 📋 Supported Origins

Your backend already supports these origins:

✅ `http://localhost:3000` (React default)  
✅ `http://localhost:3001`  
✅ `http://localhost:5173` (Vite default)  
✅ `http://localhost:4173` (Vite preview)  
✅ HTTPS versions of all above  
✅ Vercel domains (`*.vercel.app`)  
✅ Netlify domains (`*.netlify.app`)  
✅ Heroku domains (`*.herokuapp.com`)  
✅ Render domains (`*.onrender.com`)  
✅ GitHub Pages (`*.github.io`)  
✅ Custom domain from `CLIENT_URL` env var  

## 🎯 Frontend Integration Example

Here's a complete example for your frontend:

```javascript
// api.js - API utility file
const API_BASE_URL = 'https://ai-assistant-backend-oqpp.onrender.com';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth methods
  async register(email, password, name) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.token = data.token;
    localStorage.setItem('token', data.token);
    return data;
  }

  async login(email, password) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.token = data.token;
    localStorage.setItem('token', data.token);
    return data;
  }

  // Chat methods
  async sendMessage(message, conversationId) {
    return this.request('/api/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId }),
    });
  }

  async getConversations() {
    return this.request('/api/chat/conversations');
  }

  // Add more methods as needed...
}

// Usage
const api = new ApiClient();

// Register
try {
  const result = await api.register('user@example.com', 'password123', 'John Doe');
  console.log('Registered:', result.user);
} catch (error) {
  console.error('Registration failed:', error.message);
}

// Chat
try {
  const response = await api.sendMessage('Hello AI!');
  console.log('AI Response:', response.message);
} catch (error) {
  console.error('Chat failed:', error.message);
}
```

## 🎉 You're All Set!

Your backend is ready to accept requests from `http://localhost:5173`! 

**Next steps:**
1. Test the CORS with the browser console examples above
2. Integrate the API client into your frontend
3. Build your amazing AI assistant interface! 🚀

---

**Need help?** Check the other documentation files:
- `PRODUCTION_API_ENDPOINTS.md` - All API endpoints
- `API_EXAMPLES.md` - Detailed examples
- `TROUBLESHOOTING.md` - Common issues