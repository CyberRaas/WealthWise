/**
 * Redis client for agent state management and caching
 */

import Redis from 'ioredis';

let redisClient = null;
let usingInMemory = false;

/**
 * Get or create Redis client
 */
export async function getRedisClient() {
  // If already using in-memory fallback, return it immediately
  if (usingInMemory && redisClient) {
    return redisClient;
  }

  if (redisClient && redisClient.status === 'ready') {
    return redisClient;
  }

  try {
    const redisUrl = process.env.REDIS_URL || process.env.KV_URL;

    if (!redisUrl) {
      console.log('ℹ️  Redis URL not configured. Using in-memory storage (agent state will not persist between restarts).');
      usingInMemory = true;
      redisClient = createInMemoryFallback();
      return redisClient;
    }

    // Attempt Redis connection with timeout
    const tempClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 2,
      connectTimeout: 3000,
      retryStrategy(times) {
        if (times > 2) return null; // Stop retrying after 2 attempts
        return Math.min(times * 50, 1000);
      },
      lazyConnect: true, // Don't connect immediately
      enableOfflineQueue: false // Don't queue commands when offline
    });

    // Suppress error logging
    tempClient.on('error', () => {
      // Silently handle errors, will fallback to in-memory
    });

    // Try to connect with timeout
    await Promise.race([
      tempClient.connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), 3000)
      )
    ]);

    // Test connection
    await tempClient.ping();

    console.log('✅ Redis connected successfully');
    redisClient = tempClient;
    return redisClient;

  } catch (error) {
    // Silently fall back to in-memory storage
    if (redisClient && redisClient.disconnect) {
      try {
        redisClient.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
    }

    console.log('ℹ️  Redis unavailable. Using in-memory storage (agent state will not persist between restarts).');
    usingInMemory = true;
    redisClient = createInMemoryFallback();
    return redisClient;
  }
}

/**
 * In-memory fallback for development/testing
 */
function createInMemoryFallback() {
  const store = new Map();

  return {
    async get(key) {
      const item = store.get(key);
      if (!item) return null;

      if (item.expiry && item.expiry < Date.now()) {
        store.delete(key);
        return null;
      }

      return item.value;
    },

    async set(key, value, ...args) {
      const item = { value };

      // Handle EX (expiry in seconds)
      if (args[0] === 'EX' && args[1]) {
        item.expiry = Date.now() + (args[1] * 1000);
      }

      store.set(key, item);
      return 'OK';
    },

    async del(key) {
      store.delete(key);
      return 1;
    },

    async keys(pattern) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return Array.from(store.keys()).filter(k => regex.test(k));
    },

    async ping() {
      return 'PONG';
    },

    status: 'ready'
  };
}

/**
 * Close Redis connection
 */
export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
