const Redis = require('ioredis');

let redisClient = null;
let isRedisAvailable = false;

const connectRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    // Skip Redis if explicitly disabled
    if (process.env.DISABLE_REDIS === 'true') {
      console.log('⚠️  Redis disabled by environment variable');
      return null;
    }
    
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 2,
      retryStrategy: (times) => {
        if (times > 3) return null; // Stop retrying after 3 attempts
        const delay = Math.min(times * 100, 1000);
        return delay;
      },
      reconnectOnError: (err) => {
        // Only reconnect on specific errors
        const targetError = /READONLY|ECONNRESET|EPIPE|ENOTFOUND|ENETUNREACH|ETIMEDOUT|ECONNREFUSED/;
        return targetError.test(err.message);
      },
      lazyConnect: true, // Don't connect immediately
      connectTimeout: 5000, // 5 second timeout
      commandTimeout: 3000, // 3 second command timeout
      enableOfflineQueue: false // Don't queue commands when offline
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
      isRedisAvailable = true;
    });

    redisClient.on('error', (err) => {
      console.warn('⚠️  Redis error (continuing without Redis):', err.message);
      isRedisAvailable = false;
    });

    redisClient.on('close', () => {
      console.warn('⚠️  Redis connection closed');
      isRedisAvailable = false;
    });

    // Test connection with timeout
    const connectPromise = redisClient.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
    );

    await Promise.race([connectPromise, timeoutPromise]);
    
    // Test with ping
    await redisClient.ping();
    isRedisAvailable = true;
    
    return redisClient;
  } catch (error) {
    console.warn('⚠️  Redis unavailable, continuing without caching:', error.message);
    isRedisAvailable = false;
    
    // Clean up failed connection
    if (redisClient) {
      try {
        redisClient.disconnect();
      } catch (e) {
        // Ignore cleanup errors
      }
      redisClient = null;
    }
    
    return null;
  }
};

const getRedisClient = () => {
  return isRedisAvailable ? redisClient : null;
};

const isRedisConnected = () => isRedisAvailable;

// Safe Redis operations with fallback
const safeRedisOperation = async (operation, fallback = null) => {
  if (!isRedisAvailable || !redisClient) {
    return fallback;
  }
  
  try {
    return await operation(redisClient);
  } catch (error) {
    console.warn('Redis operation failed, using fallback:', error.message);
    isRedisAvailable = false;
    return fallback;
  }
};

module.exports = { 
  connectRedis, 
  getRedisClient, 
  isRedisConnected,
  safeRedisOperation
};
