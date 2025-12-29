# 🤖 Smart AI Personal Assistant Backend

A comprehensive, production-ready backend for an AI-powered personal assistant with advanced features including task management, smart reminders, document summarization, and more.

## ✨ Features

### 🔐 **Authentication & Security**
- JWT-based authentication with refresh tokens
- Google OAuth 2.0 integration
- Email verification system
- Password reset functionality
- Row-level security (RLS) with Supabase

### 🤖 **AI-Powered Features**
- **AI Chat Assistant** - GPT-4 powered conversations
- **Life Admin Manager** - Manage real-life obligations with consequences
- **Task Manager** - Extract tasks from natural language
- **Smart Reminders** - AI-powered reminder creation
- **Document Summarizer** - Upload and summarize documents
- **Email Generator** - AI-generated professional emails
- **Voice Features** - Text-to-speech and speech-to-text
- **Notes Enhancement** - Extract actions and deadlines from notes

### 📊 **Core Functionality**
- **Calendar Management** - Events, scheduling, reminders
- **Notes System** - Rich text notes with tags and search
- **File Upload** - Multi-provider support (Supabase, Cloudinary)
- **Push Notifications** - Web push notifications with VAPID
- **Real-time Features** - WebSocket support ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account
- OpenAI API key

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/ai-assistant-backend.git
cd ai-assistant-backend
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# Required: SUPABASE_URL, SUPABASE_SERVICE_KEY, OPENAI_API_KEY, JWT_SECRET
```

### 3. Database Setup
```bash
# Run the SQL schema in your Supabase SQL Editor
# Copy content from: database/schema.sql
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Verify Setup
```bash
# Test all endpoints
npm run test-endpoints

# Check health
curl http://localhost:5000/health
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/oauth/google` - Google OAuth
- `GET /api/auth/me` - Get current user

### AI Features
- `POST /api/chat/message` - Send message to AI
- `POST /api/tasks/from-message` - Extract tasks from text
- `POST /api/reminders/from-message` - Create reminders from text
- `POST /api/documents/summarize` - Summarize documents
- `POST /api/email/generate` - Generate emails

### Task Management
- `GET/POST/PUT/DELETE /api/tasks` - CRUD operations
- `POST /api/tasks/suggestions` - AI task suggestions

### Smart Reminders
- `GET/POST/PUT/DELETE /api/reminders` - CRUD operations
- `GET /api/reminders/upcoming` - Upcoming reminders

### Document Processing
- `POST /api/documents/summarize` - Upload & summarize
- `GET /api/documents/summaries` - Get all summaries
- `POST /api/documents/key-points` - Extract key points

### Additional Features
- **Life Admin Manager** - Real-life obligations with automatic task/reminder generation
- Calendar events, notes, file upload, voice features, notifications

**Total: 69 API endpoints** - See [API_EXAMPLES.md](API_EXAMPLES.md) and [LIFE_ADMIN_API_GUIDE.md](LIFE_ADMIN_API_GUIDE.md) for complete documentation.

## 🛠️ Configuration

### Required Environment Variables
```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# AI
OPENAI_API_KEY=your-openai-api-key

# Security
JWT_SECRET=your-jwt-secret-key
```

### Optional Services
```env
# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-key
EMAIL_FROM=noreply@yourdomain.com

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🧪 Testing & Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run test-life-admin  # Test Life Admin Manager
npm run start        # Start production server
npm run test-endpoints # Test all API endpoints
npm run fix          # Diagnose common issues
npm run setup        # Interactive setup guide
```

### Health Checks
```bash
# Server health
curl http://localhost:5000/health

# API status
curl http://localhost:5000/api/status

# Test CORS
curl -X OPTIONS http://localhost:5000/api/auth/login \
  -H "Origin: http://localhost:3000"
```

## 🌐 Frontend Integration

### Supported Frameworks
- ✅ React/Next.js
- ✅ Vue.js/Nuxt.js
- ✅ Angular
- ✅ Vite projects
- ✅ Mobile apps (React Native, Flutter)
- ✅ Vanilla JavaScript

### Example Integration
```javascript
// React/Next.js example
const API_BASE = 'http://localhost:5000';

const apiClient = {
  async login(email, password) {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  async getTasks(token) {
    const response = await fetch(`${API_BASE}/api/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async createTaskFromMessage(message, token) {
    const response = await fetch(`${API_BASE}/api/tasks/from-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message })
    });
    return response.json();
  }
};
```

## 🚀 Deployment

### Platform Support
- ✅ Render
- ✅ Railway
- ✅ Heroku
- ✅ DigitalOcean
- ✅ AWS/GCP/Azure
- ✅ Docker

### Environment Variables for Production
```env
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com
# Add all other required variables
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment guides.

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
- **[API_EXAMPLES.md](API_EXAMPLES.md)** - Complete API documentation
- **[FEATURES.md](FEATURES.md)** - Detailed feature list
- **[FRONTEND_CONNECTIVITY_GUIDE.md](FRONTEND_CONNECTIVITY_GUIDE.md)** - Frontend integration help
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment guides

## 🏗️ Architecture

### Tech Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **AI**: OpenAI GPT-4
- **Authentication**: JWT + Supabase Auth
- **File Storage**: Supabase Storage + Cloudinary
- **Caching**: Redis (optional)
- **Email**: SendGrid
- **Push Notifications**: Web Push (VAPID)

### Project Structure
```
src/
├── config/          # Service configurations
├── controllers/     # Route handlers
├── middlewares/     # Express middlewares
├── routes/          # API routes
├── services/        # Business logic
└── utils/           # Utility functions

database/
└── schema.sql       # Database schema

docs/
├── API_EXAMPLES.md
├── DEPLOYMENT.md
└── ...
```

## 🔧 Troubleshooting

### Common Issues

**CORS Errors:**
```bash
# Add your frontend URL to .env
CLIENT_URL=http://localhost:3000
```

**Database Connection:**
```bash
# Verify Supabase credentials
npm run fix
```

**Redis Issues:**
```bash
# Disable Redis if not needed
echo "DISABLE_REDIS=true" >> .env
```

**Port Conflicts:**
```bash
# Use different port
echo "PORT=5001" >> .env
```

Run diagnostics: `npm run fix`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Supabase for backend infrastructure
- Express.js community
- All contributors and users

## 📞 Support

- 📖 **Documentation**: Check the `/docs` folder
- 🐛 **Issues**: Open a GitHub issue
- 💬 **Discussions**: Use GitHub Discussions
- 📧 **Email**: your-email@domain.com

---

**⭐ Star this repository if it helped you build something awesome!**