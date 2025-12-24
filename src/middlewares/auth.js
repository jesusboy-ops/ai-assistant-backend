const { verifyToken } = require('../utils/jwt');
const { supabase } = require('../config/supabase');

/**
 * Authentication middleware - verifies JWT token with better error handling
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        error: {
          message: 'Authorization header is required',
          code: 'NO_AUTH_HEADER',
          statusCode: 401
        }
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: {
          message: 'Authorization header must start with "Bearer "',
          code: 'INVALID_AUTH_FORMAT',
          statusCode: 401
        }
      });
    }

    const token = authHeader.substring(7);
    
    if (!token || token.trim() === '') {
      return res.status(401).json({ 
        success: false,
        error: {
          message: 'Token is required',
          code: 'NO_TOKEN',
          statusCode: 401
        }
      });
    }

    // Verify token with timeout
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (tokenError) {
      let message = 'Invalid token';
      let code = 'INVALID_TOKEN';
      
      if (tokenError.name === 'TokenExpiredError') {
        message = 'Token has expired';
        code = 'TOKEN_EXPIRED';
      } else if (tokenError.name === 'JsonWebTokenError') {
        message = 'Malformed token';
        code = 'MALFORMED_TOKEN';
      }
      
      return res.status(401).json({ 
        success: false,
        error: {
          message,
          code,
          statusCode: 401
        }
      });
    }
    
    // Fetch user from Supabase with timeout
    const { data: user, error } = await Promise.race([
      supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .single(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      )
    ]);

    if (error) {
      console.error('Database error in auth:', error);
      return res.status(401).json({ 
        success: false,
        error: {
          message: 'User authentication failed',
          code: 'AUTH_DB_ERROR',
          statusCode: 401
        }
      });
    }

    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
          statusCode: 401
        }
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      success: false,
      error: {
        message: 'Authentication service error',
        code: 'AUTH_SERVICE_ERROR',
        statusCode: 500
      }
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      if (token && token.trim() !== '') {
        try {
          const decoded = verifyToken(token);
          
          const { data: user } = await Promise.race([
            supabase
              .from('users')
              .select('*')
              .eq('id', decoded.userId)
              .single(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Database timeout')), 3000)
            )
          ]);

          if (user) {
            req.user = user;
          }
        } catch (error) {
          // Silently continue without authentication
          console.warn('Optional auth failed:', error.message);
        }
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    console.warn('Optional auth error:', error.message);
    next();
  }
};

module.exports = { authenticate, optionalAuth };
