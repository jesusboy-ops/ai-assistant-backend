# CORS Configuration Guide

## 🌐 Current CORS Setup

Your backend is configured with a robust CORS policy that supports both development and production environments.

### ✅ Allowed Origins

**Development:**
- `http://localhost:3000` (React default)
- `http://localhost:3001` (Alternative React port)
- `http://localhost:5173` (Vite default)
- `http://localhost:4173` (Vite preview)

**Production:**
- Any URL set in `CLIENT_URL` environment variable
- No origin (for mobile apps, Postman, curl)

### ✅ CORS Features Enabled

- **Credentials**: `true` (allows cookies and auth headers)
- **Methods**: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- **Headers**: `Content-Type`, `Authorization`, `X-Requested-With`
- **Max Age**: 24 hours (reduces preflight requests)

---

## 🚀 Production Setup

### Step 1: Deploy Your Frontend

Deploy your frontend to any platform:
- **Vercel**: `https://your-app.vercel.app`
- **Netlify**: `https://your-app.netlify.app`
- **GitHub Pages**: `https://username.github.io/repo-name`
- **Custom Domain**: `https://yourdomain.com`

### Step 2: Update Environment Variables

**On Render (Production):**

1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Update `CLIENT_URL` with your frontend URL:

```
CLIENT_URL=https://your-frontend-app.vercel.app
```

**For Local Development:**

Update your `.env` file:
```env
CLIENT_URL=http://localhost:3000
```

### Step 3: Multiple Frontend URLs

If you have multiple frontend deployments (staging, production), you can modify the CORS configuration:

**Option A: Environment Variable List**
```env
CLIENT_URL=https://prod.example.com,https://staging.example.com,https://dev.example.com
```

Then update `src/index.js`:
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'http://localhost:5173',
  'http://localhost:4173',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : [])
].filter(Boolean);
```

**Option B: Separate Environment Variables**
```env
CLIENT_URL_PROD=https://prod.example.com
CLIENT_URL_STAGING=https://staging.example.com
CLIENT_URL_DEV=https://dev.example.com
```

---

## 🧪 Testing CORS

### Test 1: Browser Console

Open your frontend in browser and check console for CORS errors:

```javascript
// Should work without CORS errors
fetch('https://ai-assistant-backend-oqpp.onrender.com/health')
  .then(response => response.json())
  .then(data => console.log(data));
```

### Test 2: Different Origins

Test from different origins to ensure CORS is working:

```bash
# Should work (no origin)
curl https://ai-assistant-backend-oqpp.onrender.com/health

# Should work (allowed origin)
curl -H "Origin: http://localhost:3000" \
     https://ai-assistant-backend-oqpp.onrender.com/health

# Should fail (blocked origin)
curl -H "Origin: https://malicious-site.com" \
     https://ai-assistant-backend-oqpp.onrender.com/health
```

### Test 3: Preflight Requests

Test OPTIONS requests (preflight):

```bash
curl -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  https://ai-assistant-backend-oqpp.onrender.com/api/auth/register
```

---

## 🔧 Common CORS Issues & Solutions

### Issue 1: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Cause**: Frontend URL not in allowed origins

**Solution**: 
1. Check your frontend URL
2. Update `CLIENT_URL` environment variable
3. Restart your backend service

### Issue 2: "CORS policy: The request client is not a secure context"

**Cause**: Using HTTP in production instead of HTTPS

**Solution**: 
- Ensure your frontend uses HTTPS in production
- Update `CLIENT_URL` to use `https://` not `http://`

### Issue 3: "CORS policy: Credentials mode is 'include'"

**Cause**: Frontend sending credentials but CORS not configured

**Solution**: Already configured! Your backend supports credentials.

### Issue 4: Preflight request fails

**Cause**: Missing OPTIONS method or headers

**Solution**: Already configured! Your backend handles preflight requests.

---

## 🛡️ Security Best Practices

### ✅ What's Already Implemented

1. **Specific Origins**: Only allowed origins can access your API
2. **Credentials Support**: Secure cookie and auth header handling
3. **Method Restrictions**: Only necessary HTTP methods allowed
4. **Header Validation**: Only required headers permitted
5. **Logging**: Blocked origins are logged for monitoring

### 🔒 Additional Security (Optional)

**Rate Limiting** (not implemented):
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

**Helmet for Security Headers** (not implemented):
```javascript
const helmet = require('helmet');
app.use(helmet());
```

---

## 📱 Frontend Integration

### React/Next.js Example

```javascript
// API client with credentials
const apiClient = {
  baseURL: 'https://ai-assistant-backend-oqpp.onrender.com',
  
  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      credentials: 'include', // Important for CORS
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
};

// Usage
const data = await apiClient.request('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'User Name'
  })
});
```

### Vue.js Example

```javascript
// axios configuration
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ai-assistant-backend-oqpp.onrender.com',
  withCredentials: true, // Important for CORS
  headers: {
    'Content-Type': 'application/json'
  }
});

// Usage
const response = await api.post('/api/auth/register', {
  email: 'user@example.com',
  password: 'password123',
  name: 'User Name'
});
```

---

## 🚀 Deployment Checklist

### Before Deploying Frontend:

- [ ] Frontend uses HTTPS in production
- [ ] API calls use correct backend URL
- [ ] Credentials are included in requests
- [ ] Error handling for CORS issues

### After Deploying Frontend:

- [ ] Update `CLIENT_URL` in Render environment variables
- [ ] Test API calls from deployed frontend
- [ ] Check browser console for CORS errors
- [ ] Verify authentication works

### Environment Variables to Set:

**Development (.env):**
```env
CLIENT_URL=http://localhost:3000
```

**Production (Render):**
```env
CLIENT_URL=https://your-frontend-app.vercel.app
NODE_ENV=production
```

---

## 📊 CORS Monitoring

Your backend logs blocked CORS requests:

```
CORS blocked origin: https://malicious-site.com
```

Monitor your Render logs for:
- Unexpected blocked origins
- High number of preflight requests
- CORS-related errors

---

## 🎯 Quick Reference

**Current Backend URL**: `https://ai-assistant-backend-oqpp.onrender.com`

**Allowed Development Origins**:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:5173`
- `http://localhost:4173`

**Production Origin**: Set via `CLIENT_URL` environment variable

**CORS Features**: ✅ Credentials, ✅ All Methods, ✅ Security Headers, ✅ Preflight Caching

---

## 🆘 Need Help?

1. **Check Render logs** for CORS errors
2. **Verify CLIENT_URL** environment variable
3. **Test with curl** to isolate frontend issues
4. **Check browser console** for detailed error messages

Your CORS is now production-ready! 🎉