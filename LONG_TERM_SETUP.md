# 🚀 Long-Term Production Setup Guide

This backend is configured for **long-term, maintenance-free operation**. Follow this guide to set it up once and use it forever.

## 🎯 **One-Time Setup (Do This Once)**

### 1. **Environment Configuration**
Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Required Variables:**
```env
# Database (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# AI (REQUIRED)
OPENAI_API_KEY=sk-your-openai-api-key

# Security (REQUIRED)
JWT_SECRET=your-super-secure-32-character-secret

# Frontend URLs (ADD ALL YOUR DOMAINS)
CLIENT_URL=http://localhost:3000
FRONTEND_URL=https://yourapp.vercel.app
PRODUCTION_URL=https://yourapp.com
CUSTOM_DOMAIN_1=https://app.yourdomain.com
CUSTOM_DOMAIN_2=https://dashboard.yourdomain.com
# Add as many as needed...
```

### 2. **Database Setup**
Run the SQL in your Supabase dashboard (one-time only):

```sql
-- Copy from life-admin-schema.sql and paste in Supabase SQL Editor
```

### 3. **Verify Setup**
```bash
npm run setup-production
```

## 🌐 **CORS Configuration (Set and Forget)**

The backend is configured with **ultra-flexible CORS** that supports:

✅ **All localhost ports** (3000-9999)  
✅ **All common deployment platforms**:
- Vercel (*.vercel.app)
- Netlify (*.netlify.app) 
- Heroku (*.herokuapp.com)
- Render (*.onrender.com)
- Railway (*.railway.app)
- Fly.io (*.fly.dev)
- Firebase (*.firebase.app, *.web.app)
- GitHub Pages (*.github.io)
- And many more...

✅ **Custom domains** via environment variables  
✅ **Development mode** allows any HTTPS origin  
✅ **Production mode** with strict security

**To add new domains:** Just add them to your `.env` file:
```env
CUSTOM_DOMAIN_4=https://new-domain.com
CUSTOM_DOMAIN_5=https://another-app.io
```

## 🔒 **Security Features (Built-in)**

✅ **Rate Limiting** - Prevents abuse  
✅ **Helmet Security Headers** - XSS protection  
✅ **CORS Protection** - Only allowed origins  
✅ **JWT Authentication** - Secure user sessions  
✅ **Row Level Security** - Database isolation  
✅ **Input Validation** - Prevents injection attacks  
✅ **Request Compression** - Better performance  
✅ **Health Monitoring** - System status tracking

## 📊 **Monitoring & Health Checks**

### Health Endpoint
```http
GET /health
```

**Response includes:**
- System uptime and memory usage
- Database connection status
- Redis connection status
- AI service availability
- Feature availability
- Version information

### Production Monitoring
```bash
# Check health
npm run health-check

# View logs (Docker)
npm run docker:logs

# System status
curl http://localhost:5000/health
```

## 🚀 **Deployment Options**

### **Option 1: Render.com (Recommended)**
1. Connect your GitHub repo to Render
2. Use the included `render.yaml` configuration
3. Set environment variables in Render dashboard
4. Auto-deploys on every push

### **Option 2: Docker**
```bash
# Build and run
npm run docker:build
npm run docker:run

# Or use Docker Compose
npm run docker:compose
```

### **Option 3: Heroku**
```bash
# Deploy to Heroku
git push heroku main
```

### **Option 4: Railway**
```bash
# Deploy to Railway
railway login
railway link
railway up
```

## 🔧 **Maintenance Commands**

```bash
# Security updates
npm run security:audit

# Update dependencies
npm run update:deps

# Database backup
npm run backup:db

# Clean old logs
npm run clean:logs

# Health check
npm run health-check
```

## 📋 **API Endpoints (Production Ready)**

### **Tasks**
```http
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
POST   /api/tasks/from-message
POST   /api/tasks/split/:id
POST   /api/tasks/check-overload
```

### **Life Admin Manager**
```http
GET    /api/life-admin/obligations
POST   /api/life-admin/obligations
PUT    /api/life-admin/obligations/:id
DELETE /api/life-admin/obligations/:id
POST   /api/life-admin/obligations/:id/complete
POST   /api/life-admin/generate-plan
POST   /api/life-admin/check-deadlines
GET    /api/life-admin/stats
```

### **Other Features**
```http
GET    /api/reminders
POST   /api/reminders
GET    /api/calendar/events
POST   /api/calendar/events
POST   /api/email/generate
POST   /api/notes/analyze
```

## 🎯 **Long-Term Benefits**

✅ **No CORS Issues** - Supports any frontend domain  
✅ **Auto-Scaling** - Handles traffic spikes  
✅ **Security Hardened** - Production-grade protection  
✅ **Health Monitoring** - Know when something's wrong  
✅ **Easy Deployment** - Multiple platform support  
✅ **Maintenance Scripts** - Keep system healthy  
✅ **Docker Ready** - Containerized deployment  
✅ **Database Migrations** - Schema updates handled  
✅ **Backup Systems** - Data protection  
✅ **Rate Limiting** - Prevents abuse  

## 🔄 **Adding New Frontend Domains**

When you deploy to a new domain, just add it to your `.env`:

```env
# Add new domains here
CUSTOM_DOMAIN_6=https://my-new-app.com
CUSTOM_DOMAIN_7=https://beta.myapp.io
```

Restart the server and it will automatically accept requests from these domains.

## 🆘 **Troubleshooting**

### CORS Issues
1. Add your domain to `.env` file
2. Restart the server
3. Check `/health` endpoint

### Database Issues
1. Run `npm run setup-production`
2. Check Supabase connection
3. Verify environment variables

### Performance Issues
1. Check `/health` for memory usage
2. Enable Redis for caching
3. Monitor rate limiting

## 📞 **Support**

- Health Check: `GET /health`
- API Status: `GET /api/status`
- Documentation: See `PRODUCTION_ENDPOINTS.md`
- Logs: `npm run docker:logs`

**This backend is designed to run for years without maintenance. Set it up once, use it forever!** 🚀