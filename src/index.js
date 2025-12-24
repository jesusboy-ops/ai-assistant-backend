require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeVapidKeys } = require('./utils/vapidManager');
const { connectRedis } = require('./config/redis');
const errorHandler = require('./middlewares/errorHandler');

// Add timeout and request logging
const timeout = require('connect-timeout');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const chatRoutes = require('./routes/chat.routes');
const emailRoutes = require('./routes/email.routes');
const calendarRoutes = require('./routes/calendar.routes');
const notesRoutes = require('./routes/notes.routes');
const uploadRoutes = require('./routes/upload.routes');
const notificationRoutes = require('./routes/notification.routes');
const voiceRoutes = require('./routes/voice.routes');
const tasksRoutes = require('./routes/tasks.routes');
const remindersRoutes = require('./routes/reminders.routes');
const documentsRoutes = require('./routes/documents.routes');
const translationRoutes = require('./routes/translation.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Request timeout middleware (30 seconds)
app.use(timeout('30s'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('Origin') || 'none'}`);
  next();
});

// Timeout handler
app.use((req, res, next) => {
  if (!req.timedout) next();
});

// Enhanced CORS configuration for frontend compatibility
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) {
      console.log('CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    // Development mode - allow all origins
    if (process.env.NODE_ENV !== 'production') {
      console.log(`CORS: Development mode - allowing origin: ${origin}`);
      return callback(null, true);
    }
    
    // Production mode - check allowed origins
    const allowedOrigins = [
      // Local development
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:5173', // Vite
      'http://localhost:4173', // Vite preview
      'http://localhost:8080', // Vue CLI
      'http://localhost:8000', // Django/Python
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      
      // HTTPS local
      'https://localhost:3000',
      'https://localhost:5173',
      
      // Environment variable
      process.env.CLIENT_URL,
      process.env.FRONTEND_URL,
      
      // Common deployment platforms
      /\.vercel\.app$/,
      /\.netlify\.app$/,
      /\.herokuapp\.com$/,
      /\.onrender\.com$/,
      /\.github\.io$/,
      /\.surge\.sh$/,
      /\.firebase\.app$/,
      /\.web\.app$/
    ].filter(Boolean);
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      console.log(`CORS: Allowing origin: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`CORS: Blocking origin: ${origin}`);
      // In development, still allow but log warning
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ],
  exposedHeaders: ['Content-Length', 'X-Total-Count', 'Content-Range'],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200 // For legacy browser support
}));

// Pre-flight OPTIONS handler
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Body parsing with increased limits and better error handling
app.use(express.json({ 
  limit: '50mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ error: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '50mb',
  parameterLimit: 50000
}));

// Health check with detailed status
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {
      database: 'unknown',
      redis: 'unknown',
      openai: 'unknown'
    }
  };

  // Test Supabase connection
  try {
    const { getSupabaseStatus } = require('./config/supabase');
    health.services.database = getSupabaseStatus() ? 'ok' : 'mock';
  } catch (e) {
    health.services.database = 'error';
  }

  // Test Redis connection
  const { isRedisConnected } = require('./config/redis');
  health.services.redis = isRedisConnected() ? 'ok' : 'disabled';

  // Test OpenAI (just check if key exists)
  health.services.openai = process.env.OPENAI_API_KEY ? 'configured' : 'not_configured';

  res.json(health);
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    api: 'Smart AI Assistant Backend',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      chat: '/api/chat',
      tasks: '/api/tasks',
      reminders: '/api/reminders',
      documents: '/api/documents',
      translation: '/api/translation',
      calendar: '/api/calendar',
      notes: '/api/notes',
      voice: '/api/voice',
      upload: '/api/upload',
      notifications: '/api/notifications'
    }
  });
});

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Smart AI Assistant Backend API',
    status: 'online',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    documentation: '/api/status'
  });
});

// Auth status endpoint (what your frontend is looking for)
app.get('/api/auth/status', (req, res) => {
  res.json({
    service: 'Authentication Service',
    status: 'online',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      google: 'POST /api/auth/oauth/google',
      me: 'GET /api/auth/me'
    },
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/translation', translationRoutes);

// Error handling middleware
app.use(errorHandler);

// Timeout error handler
app.use((err, req, res, next) => {
  if (req.timedout) {
    res.status(408).json({ 
      error: 'Request timeout',
      message: 'The request took too long to process'
    });
  } else {
    next(err);
  }
});

// 404 handler with helpful message
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `The endpoint ${req.method} ${req.path} does not exist`,
    availableEndpoints: [
      'GET /health',
      'GET /api/status',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/tasks',
      'GET /api/reminders',
      'POST /api/documents/summarize'
    ]
  });
});

// Initialize services and start server
async function startServer() {
  try {
    console.log('🔄 Starting server initialization...');
    
    // Initialize VAPID keys if not present
    console.log('🔑 Initializing VAPID keys...');
    await initializeVapidKeys();
    
    // Connect to Redis (optional)
    console.log('🔗 Connecting to Redis...');
    try {
      await connectRedis();
    } catch (redisError) {
      console.warn('⚠️  Redis connection failed, continuing without Redis');
      // Don't log the error details as they're already logged in redis.js
    }
    
    // Start the server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('🚀 Server running successfully!');
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 API status: http://localhost:${PORT}/api/status`);
      console.log(`🎯 Ready for frontend connections!`);
    });

    // Set server timeout
    server.timeout = 30000; // 30 seconds
    server.keepAliveTimeout = 65000; // 65 seconds
    server.headersTimeout = 66000; // 66 seconds

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
