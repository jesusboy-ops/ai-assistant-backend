# Deployment Guide

## Deploying to Render

### Step 1: Prepare Your Repository

1. Push your code to GitHub
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

### Step 2: Create Redis Instance

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" GåÆ "Redis"
3. Configure:
   - Name: `ai-assistant-redis`
   - Plan: Free or Starter
4. Click "Create Redis"
5. Copy the **Internal Redis URL** (starts with `redis://`)

### Step 3: Create Web Service

1. Click "New +" GåÆ "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `ai-assistant-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free or Starter

### Step 4: Add Environment Variables

In the "Environment" section, add all these variables:

```
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-frontend-url.com

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-key-here

# OpenAI
OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# JWT
JWT_SECRET=your-random-jwt-secret-here
JWT_EXPIRES_IN=7d

# Redis (use the Internal Redis URL from Step 2)
REDIS_URL=redis://red-xxxxx:6379

# SendGrid
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
EMAIL_FROM=your-email@example.com

# Google OAuth (update redirect URI with your Render URL)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-app.onrender.com/api/auth/oauth/google/callback

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# VAPID (leave empty - will auto-generate)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

### Step 5: Deploy

1. Click "Create Web Service"
2. Wait for deployment to complete (5-10 minutes)
3. Your API will be available at: `https://your-app.onrender.com`

### Step 6: Update Google OAuth Redirect URI

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services GåÆ Credentials
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URI: `https://your-app.onrender.com/api/auth/oauth/google/callback`
5. Save changes

### Step 7: Test Your Deployment

Test the health endpoint:
```bash
curl https://your-app.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Deploying to Other Platforms

### Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create ai-assistant-backend`
4. Add Redis: `heroku addons:create heroku-redis:mini`
5. Set environment variables: `heroku config:set KEY=VALUE`
6. Deploy: `git push heroku main`

### Railway

1. Go to [Railway](https://railway.app/)
2. Click "New Project" GåÆ "Deploy from GitHub repo"
3. Select your repository
4. Add Redis service from Railway marketplace
5. Add environment variables in Variables tab
6. Deploy automatically

### DigitalOcean App Platform

1. Go to [DigitalOcean](https://cloud.digitalocean.com/apps)
2. Click "Create App" GåÆ "GitHub"
3. Select repository and branch
4. Configure:
   - Type: Web Service
   - Run Command: `npm start`
   - Build Command: `npm install`
5. Add environment variables
6. Add Redis database from DigitalOcean
7. Deploy

## Post-Deployment Checklist

- [ ] Database schema is set up in Supabase
- [ ] Storage bucket "files" is created in Supabase
- [ ] All environment variables are set
- [ ] Redis is connected
- [ ] Health endpoint returns 200 OK
- [ ] Test user registration
- [ ] Test user login
- [ ] Test AI chat functionality
- [ ] Update frontend API URL to production URL
- [ ] Set up monitoring (optional)
- [ ] Configure custom domain (optional)

## Monitoring & Logs

### View Logs on Render
1. Go to your service dashboard
2. Click "Logs" tab
3. View real-time logs

### Health Checks
Render automatically monitors your `/health` endpoint

### Error Tracking (Optional)
Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- DataDog for APM

## Scaling

### Render
- Upgrade to paid plan for:
  - More instances
  - Better performance
  - Custom domains
  - Zero downtime deploys

### Redis
- Upgrade Redis plan for:
  - More memory
  - Better performance
  - Persistence

## Troubleshooting

### App Won't Start
- Check logs for errors
- Verify all required environment variables are set
- Ensure Node version is >= 18.0.0

### Database Connection Issues
- Verify Supabase credentials
- Check if IP is whitelisted (Supabase allows all by default)
- Test connection from local machine

### Redis Connection Issues
- Verify REDIS_URL is correct
- Check if Redis instance is running
- Test with Redis CLI

### OpenAI API Errors
- Verify API key is valid
- Check API usage limits
- Ensure billing is set up

## Security Recommendations

1. **Rotate Secrets Regularly**
   - JWT_SECRET
   - API keys
   - Database passwords

2. **Enable HTTPS Only**
   - Render provides SSL by default
   - Enforce HTTPS in production

3. **Rate Limiting**
   - Consider adding rate limiting middleware
   - Protect against DDoS attacks

4. **CORS Configuration**
   - Update CLIENT_URL to your production frontend
   - Restrict origins in production

5. **Environment Variables**
   - Never commit .env to git
   - Use secret management tools

## Backup Strategy

1. **Database Backups**
   - Supabase provides automatic backups
   - Export data regularly

2. **Redis Backups**
   - Enable persistence if available
   - Redis data is cache - can be regenerated

3. **File Storage**
   - Supabase Storage has redundancy
   - Cloudinary has automatic backups

## Cost Optimization

### Free Tier Limits
- **Render**: 750 hours/month (1 instance)
- **Supabase**: 500MB database, 1GB storage
- **Redis**: 25MB on Render free tier
- **OpenAI**: Pay per use
- **SendGrid**: 100 emails/day free

### Tips to Reduce Costs
1. Use caching effectively
2. Optimize database queries
3. Compress images before upload
4. Use shorter JWT expiration times
5. Clean up old data regularly

## Support

For deployment issues:
- Render: https://render.com/docs
- Supabase: https://supabase.com/docs
- OpenAI: https://platform.openai.com/docs

