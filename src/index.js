require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
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
const lifeAdminRoutes = require('./routes/lifeAdmin.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== PRODUCTION SECURITY MIDDLEWARE =====

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Compression for better performance
app.use(compression());

// Rate limiting for production stability (more permissive for debugging)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Increased to 1000 requests
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and in development
    return req.path === '/health' || 
           req.path === '/api/status' || 
           process.env.NODE_ENV === 'development';
  }
});

// Apply rate limiting only in production
if (process.env.NODE_ENV === 'production') {
  app.use(limiter);
}

// Request logging (only in production if enabled)
if (process.env.ENABLE_REQUEST_LOGGING === 'true') {
  app.use(morgan('combined'));
} else if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

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

// Enhanced CORS configuration for long-term production use
app.use(cors({
  origin: function (origin, callback) {
    // Always allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Define comprehensive allowed origins for maximum flexibility
    const allowedOrigins = [
      // Local development (all common ports)
      'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003',
      'http://localhost:4000', 'http://localhost:4001', 'http://localhost:4002', 'http://localhost:4003',
      'http://localhost:5000', 'http://localhost:5001', 'http://localhost:5002', 'http://localhost:5003',
      'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', // Vite
      'http://localhost:4173', 'http://localhost:4174', 'http://localhost:4175', // Vite preview
      'http://localhost:8000', 'http://localhost:8001', 'http://localhost:8080', 'http://localhost:8081',
      'http://localhost:9000', 'http://localhost:9001', 'http://localhost:9090', 'http://localhost:9091',
      
      // HTTPS local development
      'https://localhost:3000', 'https://localhost:3001', 'https://localhost:5173', 'https://localhost:4173',
      
      // 127.0.0.1 variants
      'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:5173', 'http://127.0.0.1:4173',
      'http://127.0.0.1:8000', 'http://127.0.0.1:8080', 'http://127.0.0.1:9000', 'http://127.0.0.1:9090',
      
      // Environment variables for custom domains
      process.env.CLIENT_URL,
      process.env.FRONTEND_URL,
      process.env.PRODUCTION_URL,
      process.env.STAGING_URL,
      process.env.DEVELOPMENT_URL,
      
      // Add your specific domains here for long-term use
      process.env.CUSTOM_DOMAIN_1,
      process.env.CUSTOM_DOMAIN_2,
      process.env.CUSTOM_DOMAIN_3
    ].filter(Boolean); // Remove undefined values
    
    // Deployment platform patterns (regex for dynamic subdomains)
    const allowedPatterns = [
      /^https:\/\/.*\.vercel\.app$/,           // Vercel
      /^https:\/\/.*\.netlify\.app$/,         // Netlify
      /^https:\/\/.*\.herokuapp\.com$/,       // Heroku
      /^https:\/\/.*\.onrender\.com$/,        // Render
      /^https:\/\/.*\.railway\.app$/,         // Railway
      /^https:\/\/.*\.fly\.dev$/,             // Fly.io
      /^https:\/\/.*\.surge\.sh$/,            // Surge
      /^https:\/\/.*\.github\.io$/,           // GitHub Pages
      /^https:\/\/.*\.gitlab\.io$/,           // GitLab Pages
      /^https:\/\/.*\.firebase\.app$/,        // Firebase
      /^https:\/\/.*\.web\.app$/,             // Firebase Web App
      /^https:\/\/.*\.firebaseapp\.com$/,     // Firebase App
      /^https:\/\/.*\.amplifyapp\.com$/,      // AWS Amplify
      /^https:\/\/.*\.azurewebsites\.net$/,   // Azure
      /^https:\/\/.*\.digitaloceanspaces\.com$/, // DigitalOcean
      /^https:\/\/.*\.pages\.dev$/,           // Cloudflare Pages
      /^https:\/\/.*\.workers\.dev$/,         // Cloudflare Workers
      
      // Custom domain patterns (add your own domains here)
      /^https:\/\/.*\.yourdomain\.com$/,      // Replace with your domain
      /^https:\/\/.*\.yourapp\.io$/,          // Replace with your domain
      /^https:\/\/.*\.yourcompany\.net$/      // Replace with your domain
    ];
    
    // Check exact matches first
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Check pattern matches
    const isPatternMatch = allowedPatterns.some(pattern => pattern.test(origin));
    if (isPatternMatch) {
      return callback(null, true);
    }
    
    // In development mode, be more permissive
    if (process.env.NODE_ENV === 'development') {
      // Allow any localhost or 127.0.0.1 with any port
      if (origin.startsWith('http://localhost:') || 
          origin.startsWith('https://localhost:') ||
          origin.startsWith('http://127.0.0.1:') ||
          origin.startsWith('https://127.0.0.1:')) {
        return callback(null, true);
      }
      
      // Allow any HTTPS origin in development (for testing)
      if (origin.startsWith('https://')) {
        console.log(`🔓 Development mode: Allowing HTTPS origin: ${origin}`);
        return callback(null, true);
      }
    }
    
    // TEMPORARY: Allow all origins for debugging (remove this in production)
    if (process.env.ALLOW_ALL_ORIGINS === 'true') {
      console.log(`🔓 DEBUG: Allowing all origins - ${origin}`);
      return callback(null, true);
    }
    
    // Log blocked origins for debugging
    console.warn(`🚫 CORS: Blocked origin: ${origin}`);
    console.log('🔍 Allowed origins:', allowedOrigins.slice(0, 5), '...');
    console.log('🔍 Checking patterns for:', origin);
    
    // In production, be more permissive temporarily for debugging
    if (origin.startsWith('https://')) {
      console.log(`🔓 TEMPORARY: Allowing HTTPS origin for debugging: ${origin}`);
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS policy'));
  },
  
  // Comprehensive settings for maximum compatibility
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'Cache-Control',
    'X-File-Name',
    'X-API-Key',
    'X-Client-Version',
    'X-Request-ID',
    'User-Agent',
    'Referer'
  ],
  exposedHeaders: [
    'Content-Length', 
    'X-Total-Count', 
    'Content-Range',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-Response-Time'
  ],
  maxAge: 86400, // 24 hours cache for preflight requests
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

// Enhanced health check with comprehensive system status
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.API_VERSION || '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    },
    services: {
      database: 'unknown',
      redis: 'unknown',
      openai: 'unknown',
      email: 'unknown'
    },
    features: {
      tasks: true,
      life_admin: true,
      reminders: true,
      email: process.env.SENDGRID_API_KEY ? true : false,
      ai: process.env.OPENAI_API_KEY ? true : false,
      push_notifications: true,
      file_upload: true
    }
  };

  try {
    // Test Supabase connection
    const { getSupabaseStatus } = require('./config/supabase');
    health.services.database = getSupabaseStatus() ? 'ok' : 'mock';

    // Test Redis connection
    const { isRedisConnected } = require('./config/redis');
    health.services.redis = isRedisConnected() ? 'ok' : 'disabled';

    // Test OpenAI
    health.services.openai = process.env.OPENAI_API_KEY ? 'configured' : 'not_configured';

    // Test Email service
    health.services.email = process.env.SENDGRID_API_KEY ? 'configured' : 'not_configured';

    // Overall health status
    const criticalServices = ['database'];
    const hasFailures = criticalServices.some(service => 
      health.services[service] === 'error' || health.services[service] === 'unknown'
    );

    if (hasFailures) {
      health.status = 'degraded';
      return res.status(503).json(health);
    }

    res.json(health);
  } catch (error) {
    health.status = 'error';
    health.error = error.message;
    res.status(503).json(health);
  }
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
      lifeAdmin: '/api/life-admin',
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
app.use('/api/life-admin', lifeAdminRoutes);

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
    
    // Initialize Life Admin cron jobs
    console.log('⏰ Initializing Life Admin cron jobs...');
    try {
      // Only initialize cron jobs if Redis is available
      if (process.env.REDIS_DISABLED !== 'true' && process.env.REDIS_HOST) {
        const CronJobsService = require('./services/cronJobs.service');
        await CronJobsService.initializeCronJobs();
      } else {
        console.warn('⚠️  Cron jobs disabled (Redis not available)');
      }
    } catch (cronError) {
      console.warn('⚠️  Cron jobs initialization failed:', cronError.message);
    }
    
    // Start the server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('🚀 Server running successfully!');
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 API status: http://localhost:${PORT}/api/status`);
      console.log(`🎯 Ready for frontend connections!`);
      console.log('🧠 Life Admin Manager: Active');
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
