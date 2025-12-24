/**
 * Global error handler middleware - Frontend friendly
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error response
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'INTERNAL_ERROR';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
    code = 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
    code = 'TOKEN_EXPIRED';
  }

  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size too large';
      code = 'FILE_TOO_LARGE';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files';
      code = 'TOO_MANY_FILES';
    } else {
      message = 'File upload error';
      code = 'UPLOAD_ERROR';
    }
  }

  if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Service temporarily unavailable';
    code = 'SERVICE_UNAVAILABLE';
  }

  if (err.code === 'ETIMEDOUT' || err.timeout) {
    statusCode = 408;
    message = 'Request timeout';
    code = 'TIMEOUT';
  }

  // CORS errors
  if (err.message && err.message.includes('CORS')) {
    statusCode = 403;
    message = 'CORS policy violation';
    code = 'CORS_ERROR';
  }

  // Database errors
  if (err.code && err.code.startsWith('23')) { // PostgreSQL constraint violations
    statusCode = 400;
    if (err.code === '23505') {
      message = 'Duplicate entry - resource already exists';
      code = 'DUPLICATE_ENTRY';
    } else {
      message = 'Database constraint violation';
      code = 'CONSTRAINT_VIOLATION';
    }
  }

  // Rate limiting errors
  if (err.status === 429) {
    statusCode = 429;
    message = 'Too many requests';
    code = 'RATE_LIMITED';
  }

  // Send structured error response
  const errorResponse = {
    success: false,
    error: {
      message,
      code,
      statusCode
    },
    timestamp: new Date().toISOString()
  };

  // Add details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.details = {
      stack: err.stack,
      originalError: err.name
    };
  }

  // Add request info for debugging
  if (process.env.NODE_ENV === 'development') {
    errorResponse.request = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body
    };
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
