# CORS Configuration Update Guide

## 🎯 Allow Frontend Access

To allow your frontend at `https://spark-ai-assistant.vercel.app/` to access your backend API, you need to update the CORS configuration.

## 🔧 Step-by-Step Instructions

### Method 1: Update Environment Variable in Render (Recommended)

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com/
   - Select your service: `ai-assistant-backend-oqpp`

2. **Navigate to Environment**
   - Click on your service
   - Go to the "Environment" tab

3. **Add/Update CLIENT_URL**
   - Look for `CLIENT_URL` variable
   - If it exists, update it to: `https://spark-ai-assistant.vercel.app`
   - If it doesn't exist, add new variable:
     - **Key**: `CLIENT_URL`
     - **Value**: `https://spark-ai-assistant.vercel.app`

4. **Deploy Changes**
   - Click "Save Changes"
   - Render will automatically redeploy your service
   - Wait 2-3 minutes for deployment to complete

### Method 2: Allow Multiple Origins (If you have multiple frontends)

If you want to allow multiple frontend URLs, update the CLIENT_URL to include both:

**Key**: `CLIENT_URL`
**Value**: `https://spark-ai-assistant.vercel.app,http://localhost:3000`

## 🧪 Test CORS Configuration

After updating, test if CORS is working:

### 1. Browser Console Test
Open your frontend (`https://spark-ai-assistant.vercel.app/`) and run in browser console:

```javascript
fetch('https://ai-assistant-backend-oqpp.onrender.com/health')
  .then(response => response.json())
  .then(data => console.log('✅ CORS working:', data))
  .catch(error => console.error('❌ CORS error:', error));
```

### 2. Registration Test
```javascript
fetch('https://ai-assistant-backend-oqpp.onrender.com/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test123456',
    name: 'Test User'
  })
})
.then(response => response.json())
.then(data => console.log('✅ API working:', data))
.catch(error => console.error('❌ API error:', error));
```

## 🔍 How CORS Works in Your Backend

Your backend's CORS configuration is in `src/index.js`:

```javascript
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
```

This means:
- ✅ Requests from `CLIENT_URL` are allowed
- ✅ Cookies and credentials are included
- ❌ All other origins are blocked

## 🚨 Common CORS Errors

### Error: "Access to fetch at '...' from origin '...' has been blocked by CORS policy"

**Solution**: Make sure `CLIENT_URL` environment variable is set correctly in Render.

### Error: "No 'Access-Control-Allow-Origin' header is present"

**Solution**: 
1. Check if `CLIENT_URL` matches exactly (no trailing slash)
2. Wait for Render deployment to complete
3. Clear browser cache

### Error: "CORS policy: The request client is not a secure context"

**Solution**: Make sure your frontend uses HTTPS (Vercel provides this automatically).

## 📋 Environment Variables Checklist

Make sure these are set in Render:

### Required for CORS:
- ✅ `CLIENT_URL=https://spark-ai-assistant.vercel.app`

### Required for API:
- ✅ `NODE_ENV=production`
- ✅ `SUPABASE_URL=your-supabase-url`
- ✅ `SUPABASE_SERVICE_KEY=your-service-key`
- ✅ `OPENAI_API_KEY=your-openai-key`
- ✅ `JWT_SECRET=your-jwt-secret`

### Optional:
- `SENDGRID_API_KEY=your-sendgrid-key`
- `EMAIL_FROM=your-email@example.com`
- `GOOGLE_CLIENT_ID=your-google-client-id`
- `GOOGLE_CLIENT_SECRET=your-google-secret`
- `REDIS_URL=your-redis-url`

## 🔄 Alternative: Multiple Origins

If you need to allow multiple frontend URLs, you can modify the CORS configuration to accept an array:

**In Render Environment Variables:**
```
CLIENT_URL=https://spark-ai-assistant.vercel.app,http://localhost:3000,https://your-other-domain.com
```

The backend will automatically split by comma and allow all listed origins.

## ✅ Verification Steps

1. **Update CLIENT_URL** in Render dashboard
2. **Wait for deployment** (2-3 minutes)
3. **Test health endpoint** from your frontend
4. **Test registration** from your frontend
5. **Check browser console** for any CORS errors

## 🎉 Success Indicators

When CORS is configured correctly:
- ✅ No CORS errors in browser console
- ✅ API requests work from your frontend
- ✅ Authentication flows work
- ✅ All features accessible from frontend

## 📞 Need Help?

If you're still getting CORS errors:

1. **Check Render logs**:
   - Go to your service in Render
   - Click "Logs" tab
   - Look for any error messages

2. **Verify environment variables**:
   - Ensure `CLIENT_URL` is exactly: `https://spark-ai-assistant.vercel.app`
   - No trailing slash
   - Correct protocol (https)

3. **Test with curl**:
   ```bash
   curl -H "Origin: https://spark-ai-assistant.vercel.app" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        https://ai-assistant-backend-oqpp.onrender.com/api/auth/register
   ```

## 🚀 Quick Fix Commands

If you prefer to update via Render CLI:

```bash
# Install Render CLI
npm install -g @render/cli

# Login
render login

# Update environment variable
render env set CLIENT_URL=https://spark-ai-assistant.vercel.app --service=your-service-id
```

---

**After updating CLIENT_URL, your frontend at `https://spark-ai-assistant.vercel.app/` will be able to access your backend API without CORS errors!** 🎊