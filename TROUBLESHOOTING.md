# Troubleshooting Guide

Common issues and their solutions.

## Installation Issues

### npm install fails

**Error**: `npm ERR! code EACCES`

**Solution**:
```bash
# Fix npm permissions
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.config

# Or use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### bcrypt installation fails

**Error**: `node-gyp rebuild failed`

**Solution**:
```bash
# macOS
xcode-select --install

# Ubuntu/Debian
sudo apt-get install build-essential python3

# Windows
npm install --global windows-build-tools
```

---

## Server Startup Issues

### Port already in use

**Error**: `Error: listen EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Find process using port 5000
# macOS/Linux
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in .env
PORT=3000
```

### Missing environment variables

**Error**: `Missing Supabase credentials in environment variables`

**Solution**:
1. Check if `.env` file exists in root directory
2. Verify all required variables are set:
   ```
   SUPABASE_URL=...
   SUPABASE_SERVICE_KEY=...
   OPENAI_API_KEY=...
   JWT_SECRET=...
   ```
3. Restart the server after updating `.env`

### JWT_SECRET error

**Error**: `JWT_SECRET is required in environment variables`

**Solution**:
```bash
# Generate a secure random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env
JWT_SECRET=generated-secret-here
```

---

## Database Issues

### Supabase connection fails

**Error**: `Failed to connect to Supabase`

**Solution**:
1. Verify credentials in `.env`
2. Check Supabase project is active (not paused)
3. Test connection:
   ```bash
   curl https://YOUR_PROJECT.supabase.co/rest/v1/
   ```
4. Ensure you're using `service_role` key, not `anon` key

### Tables not found

**Error**: `relation "users" does not exist`

**Solution**:
1. Go to Supabase SQL Editor
2. Run the complete schema from `database/schema.sql`
3. Verify tables exist in Table Editor
4. Check RLS policies are created

### Storage bucket missing

**Error**: `Bucket not found`

**Solution**:
1. Go to Supabase Storage
2. Create new bucket named `files`
3. Set as public
4. Enable RLS if needed

---

## Redis Issues

### Redis connection fails

**Error**: `Redis connection error: ECONNREFUSED`

**Solution**:

**Option 1: Start Redis locally**
```bash
# macOS
brew services start redis

# Ubuntu/Debian
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:alpine

# Windows
# Download and run from https://redis.io/download
```

**Option 2: Use cloud Redis**
```bash
# Update REDIS_URL in .env with cloud Redis URL
REDIS_URL=redis://username:password@host:port
```

**Option 3: Run without Redis**
- The app will continue without Redis
- Caching and job queues will be disabled
- Warning message will appear in logs

### Redis authentication fails

**Error**: `NOAUTH Authentication required`

**Solution**:
```bash
# Update REDIS_URL with password
REDIS_URL=redis://:your-password@localhost:6379

# Or for cloud Redis
REDIS_URL=redis://username:password@host:port
```

---

## OpenAI API Issues

### Invalid API key

**Error**: `Incorrect API key provided`

**Solution**:
1. Verify API key in `.env`
2. Check key hasn't expired
3. Generate new key at https://platform.openai.com/api-keys
4. Ensure no extra spaces in `.env`

### Rate limit exceeded

**Error**: `Rate limit reached for requests`

**Solution**:
1. Wait a few minutes and try again
2. Upgrade OpenAI plan
3. Implement request queuing
4. Add rate limiting in your app

### Insufficient quota

**Error**: `You exceeded your current quota`

**Solution**:
1. Add payment method to OpenAI account
2. Check billing at https://platform.openai.com/account/billing
3. Upgrade plan if needed

---

## Authentication Issues

### Token expired

**Error**: `Token expired`

**Solution**:
- Login again to get new token
- Implement token refresh in frontend
- Adjust JWT_EXPIRES_IN in `.env` (default: 7d)

### Invalid token

**Error**: `Invalid or expired token`

**Solution**:
1. Ensure token is sent in header: `Authorization: Bearer TOKEN`
2. Check token hasn't been modified
3. Verify JWT_SECRET hasn't changed
4. Login again to get fresh token

### Google OAuth fails

**Error**: `Invalid Google token`

**Solution**:
1. Verify Google Client ID and Secret in `.env`
2. Check redirect URI matches in Google Console
3. Ensure OAuth consent screen is configured
4. Test with Google OAuth Playground

---

## File Upload Issues

### File too large

**Error**: `File too large`

**Solution**:
1. Current limit is 10MB
2. Compress images before upload
3. Increase limit in `src/middlewares/upload.js`:
   ```javascript
   limits: {
     fileSize: 20 * 1024 * 1024 // 20MB
   }
   ```

### Invalid file type

**Error**: `Invalid file type`

**Solution**:
1. Check allowed types in `src/middlewares/upload.js`
2. Add your file type to `allowedTypes` regex
3. Ensure correct MIME type

### Cloudinary upload fails

**Error**: `Cloudinary upload error`

**Solution**:
1. Verify Cloudinary credentials in `.env`
2. Check Cloudinary account is active
3. Verify upload preset if using unsigned uploads
4. Fall back to Supabase storage

---

## Email Issues

### SendGrid not sending

**Error**: `Failed to send email`

**Solution**:
1. Verify SendGrid API key in `.env`
2. Check sender email is verified in SendGrid
3. Verify account is not suspended
4. Check SendGrid activity logs
5. Ensure not exceeding free tier limit (100/day)

### Email not received

**Solution**:
1. Check spam folder
2. Verify recipient email is correct
3. Check SendGrid activity logs
4. Verify sender domain is authenticated
5. Test with different email provider

---

## Push Notification Issues

### VAPID keys not generated

**Error**: `VAPID keys not found`

**Solution**:
```bash
# Generate manually
npm run generate-vapid

# Or let app auto-generate on first run
npm start
```

### Push subscription fails

**Error**: `Subscription failed`

**Solution**:
1. Ensure HTTPS (required for push notifications)
2. Check browser supports push notifications
3. Verify VAPID keys are set
4. Test with different browser

---

## Performance Issues

### Slow API responses

**Solution**:
1. Enable Redis caching
2. Add database indexes (already in schema)
3. Optimize database queries
4. Use connection pooling
5. Enable compression middleware

### High memory usage

**Solution**:
1. Limit file upload sizes
2. Implement pagination
3. Clear old conversations/messages
4. Optimize image processing
5. Use streaming for large files

---

## Deployment Issues (Render)

### Build fails

**Solution**:
1. Check Node version (>= 18.0.0)
2. Verify package.json is correct
3. Check build logs for errors
4. Ensure all dependencies are in `dependencies`, not `devDependencies`

### Environment variables not working

**Solution**:
1. Re-enter variables in Render dashboard
2. Check for typos in variable names
3. Restart service after adding variables
4. Don't use quotes around values in Render

### App crashes after deploy

**Solution**:
1. Check logs in Render dashboard
2. Verify all environment variables are set
3. Test database connection
4. Check Redis connection
5. Ensure PORT is not hardcoded

---

## Common Error Messages

### "Cannot find module"

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "Unexpected token"

**Solution**:
- Check Node version (>= 18.0.0)
- Look for syntax errors in recent changes
- Verify JSON is valid in `.env` or config files

### "CORS error"

**Solution**:
1. Update CLIENT_URL in `.env`
2. Check CORS configuration in `src/index.js`
3. Ensure credentials are included in frontend requests

---

## Debugging Tips

### Enable detailed logging

Add to `.env`:
```
NODE_ENV=development
DEBUG=*
```

### Test individual services

```javascript
// Test Supabase
const supabase = require('./src/config/supabase');
supabase.from('users').select('*').limit(1).then(console.log);

// Test OpenAI
const openai = require('./src/config/openai');
openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'test' }]
}).then(console.log);

// Test Redis
const { getRedisClient } = require('./src/config/redis');
const redis = getRedisClient();
redis.ping().then(console.log);
```

### Check service status

```bash
# Health check
curl http://localhost:5000/health

# Test auth
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test"}'
```

---

## Getting Help

If you're still stuck:

1. **Check logs**: Look for error messages in console
2. **Search issues**: Check GitHub issues for similar problems
3. **Documentation**: Review README.md and API_EXAMPLES.md
4. **Community**: Ask in discussions or forums
5. **Create issue**: Open a GitHub issue with:
   - Error message
   - Steps to reproduce
   - Environment details
   - Relevant logs

---

## Preventive Measures

### Before deploying:
- [ ] Test all endpoints locally
- [ ] Run database migrations
- [ ] Verify all environment variables
- [ ] Test with production-like data
- [ ] Check error handling
- [ ] Review security settings

### Regular maintenance:
- [ ] Update dependencies monthly
- [ ] Rotate API keys quarterly
- [ ] Clean up old data
- [ ] Monitor error logs
- [ ] Check API usage/costs
- [ ] Backup database regularly

---

## Quick Fixes Checklist

When something breaks:

1. [ ] Restart the server
2. [ ] Check `.env` file exists and is correct
3. [ ] Verify all services are running (Redis, Supabase)
4. [ ] Check recent code changes
5. [ ] Review error logs
6. [ ] Test with curl/Postman
7. [ ] Check service status pages
8. [ ] Verify API keys are valid
9. [ ] Clear cache and restart
10. [ ] Rollback to last working version

---

## Still Having Issues?

Create a detailed bug report with:

```
**Environment:**
- OS: 
- Node version: 
- npm version: 

**Issue:**
[Describe the problem]

**Steps to reproduce:**
1. 
2. 
3. 

**Expected behavior:**
[What should happen]

**Actual behavior:**
[What actually happens]

**Error logs:**
```
[Paste error messages]
```

**Additional context:**
[Any other relevant information]
```
