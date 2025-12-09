# Quick Start Guide

Get your AI Assistant backend running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Git installed
- Supabase account (free)
- OpenAI API key

## Step 1: Clone & Install (2 minutes)

```bash
# Clone the repository
git clone <your-repo-url>
cd ai-assistant-backend

# Install dependencies
npm install
```

## Step 2: Set Up Supabase (2 minutes)

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for project to be ready (~2 minutes)
3. Go to **SQL Editor** and run the schema:
   - Copy contents from `database/schema.sql`
   - Paste and click "Run"
4. Go to **Storage** → Create bucket named `files` (set as public)
5. Go to **Settings** → **API** and copy:
   - Project URL
   - `service_role` key (not anon key!)

## Step 3: Configure Environment (1 minute)

The `.env` file is already created with your credentials. Just verify:

```bash
# Check if .env exists
cat .env
```

If you need to update any values, edit `.env`:
```bash
# Required - Already set
SUPABASE_URL=https://mvohkcthbtifkgkgimhe.supabase.co
SUPABASE_SERVICE_KEY=your-key-here
OPENAI_API_KEY=your-key-here
JWT_SECRET=your-secret-here

# Optional - Can use defaults
REDIS_URL=redis://localhost:6379  # or use cloud Redis
```

## Step 4: Start Redis (Optional)

### Option A: Use Docker (Recommended)
```bash
docker run -d -p 6379:6379 redis:alpine
```

### Option B: Install Locally
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Windows
# Download from https://redis.io/download
```

### Option C: Skip Redis
The app will work without Redis, but caching and job queues will be disabled.

## Step 5: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

You should see:
```
🚀 Server running on port 5000
📝 Environment: development
🔗 Health check: http://localhost:5000/health
✅ VAPID keys generated and saved to .env
✅ Redis connected successfully
```

## Step 6: Test the API

### Test Health Endpoint
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

Expected response:
```json
{
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "name": "Test User",
    "email_verified": false
  },
  "token": "jwt-token-here"
}
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Send AI Chat Message
```bash
# Replace YOUR_TOKEN with the token from login/register
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "Hello, who are you?"
  }'
```

Expected response:
```json
{
  "conversationId": "uuid-here",
  "message": "Hello! I'm JARVIS, your AI assistant...",
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 100,
    "total_tokens": 150
  }
}
```

## Common Issues & Solutions

### Issue: "Missing Supabase credentials"
**Solution**: Make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in `.env`

### Issue: "Missing OpenAI API key"
**Solution**: Add your OpenAI API key to `.env` as OPENAI_API_KEY

### Issue: "Redis connection error"
**Solution**: 
- Start Redis locally, or
- Use a cloud Redis service, or
- The app will continue without Redis (caching disabled)

### Issue: "JWT_SECRET is required"
**Solution**: Add a random string as JWT_SECRET in `.env`
```bash
# Generate a random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Issue: Port 5000 already in use
**Solution**: Change PORT in `.env` to another port like 3000 or 8000

### Issue: Database tables not found
**Solution**: Make sure you ran the SQL schema in Supabase SQL Editor

## Next Steps

1. **Test All Endpoints**: Use the API examples in `API_EXAMPLES.md`
2. **Set Up Frontend**: Connect your React/Vue/Angular frontend
3. **Configure OAuth**: Set up Google OAuth for social login
4. **Enable Emails**: Add SendGrid API key for email features
5. **Deploy**: Follow `DEPLOYMENT.md` to deploy to Render

## Development Tips

### Auto-reload on Changes
```bash
npm run dev
```

### View Logs
Logs are printed to console. For production, consider using a logging service.

### Test with Postman
Import the API collection from `postman_collection.json` (if available)

### Database GUI
Use Supabase Studio (built-in) to view and edit data

### Redis GUI
Use RedisInsight or redis-cli to inspect cache

## Project Structure Overview

```
src/
├── config/          # Service configurations
├── controllers/     # Request handlers
├── services/        # Business logic
├── routes/          # API endpoints
├── middlewares/     # Auth, validation, etc.
├── utils/           # Helper functions
└── index.js         # App entry point
```

## Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run generate-vapid  # Generate VAPID keys for push notifications
```

## Environment Variables Quick Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 5000 | Server port |
| NODE_ENV | No | development | Environment |
| SUPABASE_URL | Yes | - | Supabase project URL |
| SUPABASE_SERVICE_KEY | Yes | - | Supabase service key |
| OPENAI_API_KEY | Yes | - | OpenAI API key |
| JWT_SECRET | Yes | - | JWT signing secret |
| REDIS_URL | No | redis://localhost:6379 | Redis connection |
| SENDGRID_API_KEY | No | - | SendGrid for emails |
| GOOGLE_CLIENT_ID | No | - | Google OAuth |

## Getting Help

- Check `README.md` for detailed documentation
- Check `DEPLOYMENT.md` for deployment guides
- Check `API_EXAMPLES.md` for API usage examples
- Open an issue on GitHub

## Success! 🎉

Your AI Assistant backend is now running! You can:
- Register and login users
- Chat with AI
- Generate emails
- Manage calendar and notes
- Upload files
- Send push notifications
- Convert text to speech

Happy coding! 🚀
