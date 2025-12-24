# Frontend Connectivity Guide

## 🚀 Quick Fix Checklist

### 1. **Start the Server**
```bash
npm install
npm run dev
```

### 2. **Verify Server is Running**
- Check console for: `🚀 Server running successfully!`
- Test health endpoint: `http://localhost:5000/health`
- Test API status: `http://localhost:5000/api/status`

### 3. **Check Environment Variables**
Ensure your `.env` file has:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
OPENAI_API_KEY=your-openai-key
```

## 🔧 Common Issues & Solutions

### **Issue 1: CORS Errors**

**Symptoms:**
- `Access to fetch at 'http://localhost:5000' from origin 'http://localhost:3000' has been blocked by CORS policy`
- Network tab shows failed OPTIONS requests

**Solutions:**
1. **Update CLIENT_URL in .env:**
   ```env
   CLIENT_URL=http://localhost:3000
   FRONTEND_URL=http://localhost:3000
   ```

2. **Add your frontend URL to allowed origins:**
   ```env
   # For React (Create React App)
   CLIENT_URL=http://localhost:3000
   
   # For Vite
   CLIENT_URL=http://localhost:5173
   
   # For Next.js
   CLIENT_URL=http://localhost:3000
   
   # For Vue CLI
   CLIENT_URL=http://localhost:8080
   ```

3. **Multiple frontend URLs:**
   ```env
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080
   ```

### **Issue 2: Request Timeouts**

**Symptoms:**
- Requests hang and timeout
- 408 Request Timeout errors

**Solutions:**
1. **Check server logs** for database connection issues
2. **Verify Supabase credentials** in .env
3. **Test database connection:**
   ```bash
   curl http://localhost:5000/health
   ```

### **Issue 3: Authentication Errors**

**Symptoms:**
- 401 Unauthorized errors
- "Invalid token" messages

**Solutions:**
1. **Check JWT token format:**
   ```javascript
   // Correct format
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```

2. **Verify token is not expired:**
   ```javascript
   // Check token expiration
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log('Token expires:', new Date(payload.exp * 1000));
   ```

### **Issue 4: File Upload Issues**

**Symptoms:**
- File uploads fail
- "File too large" errors

**Solutions:**
1. **Check file size limits** (current: 50MB)
2. **Verify file types** are supported
3. **Use correct form data:**
   ```javascript
   const formData = new FormData();
   formData.append('file', file);
   
   fetch('/api/documents/summarize', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${token}`
       // Don't set Content-Type for FormData
     },
     body: formData
   });
   ```

## 🌐 Frontend Integration Examples

### **React/Next.js Example**

```javascript
// api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email, password) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('token', response.token);
    }
    
    return response;
  }

  // Task methods
  async getTasks() {
    return this.request('/api/tasks');
  }

  async createTask(taskData) {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  // Document methods
  async summarizeDocument(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request('/api/documents/summarize', {
      method: 'POST',
      headers: {}, // Remove Content-Type for FormData
      body: formData,
    });
  }
}

export default new ApiClient();
```

### **Vue.js Example**

```javascript
// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:5000',
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
```

### **Vanilla JavaScript Example**

```javascript
// api.js
class API {
  constructor() {
    this.baseURL = 'http://localhost:5000';
    this.token = localStorage.getItem('token');
  }

  async fetch(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Request failed');
    }

    return response.json();
  }

  async login(email, password) {
    const data = await this.fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.token = data.token;
    localStorage.setItem('token', data.token);
    return data;
  }
}

const api = new API();
```

## 🔍 Debugging Tools

### **1. Browser Developer Tools**

**Network Tab:**
- Check if requests are being sent
- Look for CORS preflight OPTIONS requests
- Check response status codes and headers

**Console Tab:**
- Look for CORS error messages
- Check for JavaScript errors
- Monitor API responses

### **2. Server Logs**

The server provides detailed logging:
```bash
# Start server with logs
npm run dev

# Look for these messages:
✅ Supabase connection successful
🚀 Server running successfully!
CORS: Development mode - allowing origin: http://localhost:3000
```

### **3. Test Endpoints**

```bash
# Test server health
curl http://localhost:5000/health

# Test API status
curl http://localhost:5000/api/status

# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test with token
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🚨 Emergency Fixes

### **If Nothing Works:**

1. **Restart everything:**
   ```bash
   # Kill all node processes
   pkill -f node
   
   # Restart server
   npm run dev
   
   # Restart frontend
   npm start
   ```

2. **Check ports:**
   ```bash
   # Check if port 5000 is in use
   lsof -i :5000
   
   # Use different port if needed
   PORT=5001 npm run dev
   ```

3. **Clear browser cache:**
   - Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
   - Clear localStorage
   - Disable browser cache in DevTools

4. **Temporary CORS bypass:**
   ```bash
   # Start Chrome with disabled security (development only!)
   chrome --disable-web-security --user-data-dir=/tmp/chrome_dev
   ```

## 📱 Mobile/React Native

For mobile apps, ensure you're using the correct IP address:

```javascript
// Use your computer's IP address, not localhost
const API_BASE_URL = 'http://192.168.1.100:5000';

// Or use ngrok for external access
const API_BASE_URL = 'https://your-ngrok-url.ngrok.io';
```

## 🌍 Production Deployment

When deploying to production:

1. **Update environment variables:**
   ```env
   NODE_ENV=production
   CLIENT_URL=https://your-frontend-domain.com
   ```

2. **Add your production domain** to CORS origins

3. **Use HTTPS** for both frontend and backend

4. **Set proper timeouts** for your hosting platform

## 📞 Still Having Issues?

1. **Check the server logs** for specific error messages
2. **Test with Postman** or curl to isolate frontend issues
3. **Verify all environment variables** are set correctly
4. **Check firewall/antivirus** isn't blocking connections
5. **Try a different port** if 5000 is occupied

The backend is designed to be frontend-friendly with detailed error messages and comprehensive CORS support. Most issues are related to environment configuration or network settings.