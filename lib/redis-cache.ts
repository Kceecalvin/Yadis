/**
 * Redis Cache Service
 * Handles distributed caching with Redis
 */

import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

/**
 * Initialize Redis connection
 */
export async function connectRedis(): Promise<RedisClientType | null> {
  if (!process.env.REDIS_URL) {
    console.warn('⚠️  REDIS_URL not configured, using in-memory cache only');
    return null;
  }

  try {
    if (redisClient && redisClient.isOpen) {
      return redisClient;
    }

    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Max Redis reconnection attempts reached');
            return new Error('Max retries exceeded');
          }
          return retries * 100;
        },
      },
    });

    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Connected to Redis');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    return null;
  }
}

/**
 * Set cache value with TTL
 */
export async function setCacheRedis(
  key: string,
  value: any,
  ttl: number = 600 // 10 minutes default
): Promise<boolean> {
  try {
    const client = await connectRedis();
    if (!client) return false;

    const serialized = JSON.stringify(value);
    await client.setEx(key, ttl, serialized);
    console.log(`📝 Cached: ${key} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    console.error('Error setting Redis cache:', error);
    return false;
  }
}

/**
 * Get cache value
 */
export async function getCacheRedis(key: string): Promise<any | null> {
  try {
    const client = await connectRedis();
    if (!client) return null;

    const value = await client.get(key);
    if (value) {
      console.log(`✅ Cache HIT: ${key}`);
      return JSON.parse(value);
    }

    console.log(`❌ Cache MISS: ${key}`);
    return null;
  } catch (error) {
    console.error('Error getting Redis cache:', error);
    return null;
  }
}

/**
 * Delete cache key
 */
export async function deleteCacheRedis(key: string): Promise<boolean> {
  try {
    const client = await connectRedis();
    if (!client) return false;

    await client.del(key);
    console.log(`🗑️  Deleted cache: ${key}`);
    return true;
  } catch (error) {
    console.error('Error deleting Redis cache:', error);
    return false;
  }
}

/**
 * Delete cache by pattern
 */
export async function deleteCachePatternRedis(pattern: string): Promise<number> {
  try {
    const client = await connectRedis();
    if (!client) return 0;

    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
      console.log(`🗑️  Deleted ${keys.length} cache keys matching: ${pattern}`);
      return keys.length;
    }
    return 0;
  } catch (error) {
    console.error('Error deleting cache pattern:', error);
    return 0;
  }
}

/**
 * Clear all cache
 */
export async function clearAllCacheRedis(): Promise<boolean> {
  try {
    const client = await connectRedis();
    if (!client) return false;

    await client.flushDb();
    console.log('🧹 Cleared all Redis cache');
    return true;
  } catch (error) {
    console.error('Error clearing Redis cache:', error);
    return false;
  }
}

/**
 * Get or set cache (compute if not exists)
 */
export async function getOrSetCacheRedis<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 600
): Promise<T> {
  try {
    // Try to get from cache
    const cached = await getCacheRedis(key);
    if (cached !== null) {
      return cached as T;
    }

    // Compute value
    const value = await fn();

    // Cache it
    await setCacheRedis(key, value, ttl);

    return value;
  } catch (error) {
    console.error('Error in getOrSetCacheRedis:', error);
    // Fallback to computing value without caching
    return fn();
  }
}

/**
 * Get cache info/stats
 */
export async function getCacheStatsRedis(): Promise<any> {
  try {
    const client = await connectRedis();
    if (!client) return null;

    const info = await client.info('stats');
    const keys = await client.keys('*');

    return {
      connected: true,
      keyCount: keys.length,
      info,
    };
  } catch (error) {
    console.error('Error getting Redis stats:', error);
    return { connected: false };
  }
}

/**
 * Increment counter
 */
export async function incrementCounterRedis(
  key: string,
  amount: number = 1,
  ttl?: number
): Promise<number> {
  try {
    const client = await connectRedis();
    if (!client) return 0;

    const newValue = await client.incrBy(key, amount);

    if (ttl) {
      await client.expire(key, ttl);
    }

    return newValue;
  } catch (error) {
    console.error('Error incrementing Redis counter:', error);
    return 0;
  }
}

/**
 * Set if not exists
 */
export async function setIfNotExistsRedis(
  key: string,
  value: any,
  ttl: number = 600
): Promise<boolean> {
  try {
    const client = await connectRedis();
    if (!client) return false;

    const result = await client.setNX(key, JSON.stringify(value));
    if (result && ttl) {
      await client.expire(key, ttl);
    }

    return !!result;
  } catch (error) {
    console.error('Error in setIfNotExistsRedis:', error);
    return false;
  }
}

/**
 * Disconnect Redis
 */
export async function disconnectRedis(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    console.log('Redis disconnected');
    redisClient = null;
  }
}

export default {
  connectRedis,
  setCacheRedis,
  getCacheRedis,
  deleteCacheRedis,
  deleteCachePatternRedis,
  clearAllCacheRedis,
  getOrSetCacheRedis,
  getCacheStatsRedis,
  incrementCounterRedis,
  setIfNotExistsRedis,
  disconnectRedis,
};
