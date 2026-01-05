/**
 * Caching layer for e-commerce platform
 * Implements Redis-like caching with TTL support
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// In-memory cache (use Redis in production)
const cache = new Map<string, CacheEntry<any>>();

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 15 * 60, // 15 minutes
  LONG: 60 * 60, // 1 hour
  VERY_LONG: 24 * 60 * 60, // 24 hours
};

// Cache key patterns
export const CACHE_KEYS = {
  // Products
  PRODUCTS: 'products:*',
  PRODUCT: (id: string) => `product:${id}`,
  PRODUCT_BY_SLUG: (slug: string) => `product:slug:${slug}`,
  PRODUCTS_BY_CATEGORY: (categoryId: string) => `products:category:${categoryId}`,
  PRODUCT_REVIEWS: (productId: string) => `reviews:product:${productId}`,

  // Categories
  CATEGORIES: 'categories:all',
  CATEGORY: (id: string) => `category:${id}`,
  CATEGORY_BY_SLUG: (slug: string) => `category:slug:${slug}`,

  // Users
  USER: (id: string) => `user:${id}`,
  USER_WISHLIST: (userId: string) => `wishlist:${userId}`,
  USER_ORDERS: (userId: string) => `orders:${userId}`,

  // Orders
  ORDER: (id: string) => `order:${id}`,
  ORDER_TRACKING: (orderId: string) => `tracking:${orderId}`,

  // Analytics
  TOP_PRODUCTS: 'analytics:top-products',
  ANALYTICS_DASHBOARD: 'analytics:dashboard',

  // Search
  SEARCH_RESULTS: (query: string) => `search:${query}`,
};

/**
 * Set cache entry with TTL
 * @param key Cache key
 * @param data Data to cache
 * @param ttlSeconds Time to live in seconds (default: 5 minutes)
 */
export function setCacheEntry<T>(
  key: string,
  data: T,
  ttlSeconds: number = 300
): void {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  cache.set(key, { data, expiresAt });
}

/**
 * Get cache entry if not expired
 */
export function getCacheEntry<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;

  if (!entry) return null;

  // Check if expired
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Invalidate cache entry
 */
export function invalidateCache(key: string): void {
  cache.delete(key);
}

/**
 * Invalidate cache by pattern
 */
export function invalidateCachePattern(pattern: RegExp | string): number {
  let deleted = 0;
  const regex = typeof pattern === 'string' 
    ? new RegExp(`^${pattern}`.replace(/\*/g, '.*'))
    : pattern;
  
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
      deleted++;
    }
  }
  return deleted;
}

/**
 * Invalidate all cache entries matching pattern
 */
export function invalidateCachePattern(pattern: string): void {
  const regex = new RegExp(pattern);
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  cache.clear();
}

// Cache key generators
export const CACHE_KEYS = {
  // Product reviews
  PRODUCT_REVIEWS: (productId: string) =>
    `reviews:product:${productId}`,
  PRODUCT_STATS: (productId: string) =>
    `reviews:stats:${productId}`,

  // Orders
  ORDER_TRACKING: (orderId: string) =>
    `order:tracking:${orderId}`,
  USER_ORDERS: (userId: string) =>
    `orders:user:${userId}`,
  ORDER_HISTORY: (userId: string) =>
    `orders:history:${userId}`,

  // Coupons
  COUPON_CODE: (code: string) =>
    `coupon:code:${code}`,
  COUPON_LIST: 'coupons:all',
  COUPON_USAGE: (userId: string) =>
    `coupon:usage:${userId}`,

  // Search
  SEARCH_FILTERS: (userId: string) =>
    `search:filters:${userId}`,

  // Products
  PRODUCT_DETAILS: (productId: string) =>
    `product:${productId}`,
  PRODUCT_LIST: (categoryId: string) =>
    `products:category:${categoryId}`,

  // Categories
  CATEGORIES: 'categories:all',
  CATEGORY_DETAILS: (categoryId: string) =>
    `category:${categoryId}`,

  // Users
  USER_REWARDS: (userId: string) =>
    `user:rewards:${userId}`,
  USER_ANALYTICS: (userId: string) =>
    `user:analytics:${userId}`,
  USER_LOYALTY_TIER: (userId: string) =>
    `user:loyalty:${userId}`,

  // Support
  SUPPORT_TICKETS: (userId: string) =>
    `support:tickets:${userId}`,
  SUPPORT_TICKET_DETAIL: (ticketId: string) =>
    `support:ticket:${ticketId}`,
};

// TTL constants (in seconds)
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
  PRODUCT_REVIEWS: 300, // 5 minutes (frequently updated)
  PRODUCT_DETAILS: 3600, // 1 hour
  CATEGORIES: 86400, // 24 hours (rarely changes)
  USER_DATA: 300, // 5 minutes (personalized)
  ORDER_TRACKING: 60, // 1 minute (frequently checked)
};

/**
 * Decorator for caching function results
 */
export function withCache<T>(
  keyGenerator: () => string,
  ttl: number = CACHE_TTL.MEDIUM
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]): Promise<T> {
      const cacheKey = keyGenerator();

      // Try to get from cache
      const cached = getCacheEntry<T>(cacheKey);
      if (cached) {
        console.log(`Cache hit: ${cacheKey}`);
        return cached;
      }

      // Call original method
      console.log(`Cache miss: ${cacheKey}`);
      const result = await originalMethod.apply(this, args);

      // Store in cache
      setCacheEntry(cacheKey, result, ttl);

      return result;
    };

    return descriptor;
  };
}

/**
 * Cache invalidation triggers
 */
export const INVALIDATION_TRIGGERS = {
  // When review is created/updated
  onReviewChange: (productId: string) => {
    invalidateCache(CACHE_KEYS.PRODUCT_REVIEWS(productId));
    invalidateCache(CACHE_KEYS.PRODUCT_STATS(productId));
  },

  // When order status changes
  onOrderStatusChange: (orderId: string, userId: string) => {
    invalidateCache(CACHE_KEYS.ORDER_TRACKING(orderId));
    invalidateCache(CACHE_KEYS.USER_ORDERS(userId));
    invalidateCache(CACHE_KEYS.ORDER_HISTORY(userId));
  },

  // When coupon is used
  onCouponUsed: () => {
    invalidateCachePattern('coupon:');
  },

  // When user makes purchase
  onPurchase: (userId: string) => {
    invalidateCache(CACHE_KEYS.USER_ORDERS(userId));
    invalidateCache(CACHE_KEYS.USER_REWARDS(userId));
    invalidateCache(CACHE_KEYS.USER_LOYALTY_TIER(userId));
    invalidateCache(CACHE_KEYS.USER_ANALYTICS(userId));
  },

  // When product changes
  onProductChange: (productId: string) => {
    invalidateCache(CACHE_KEYS.PRODUCT_DETAILS(productId));
    invalidateCachePattern(`products:category:`);
  },
};

/**
 * Cache statistics
 */
export function getCacheStats() {
  let size = 0;
  let expired = 0;

  for (const [, entry] of cache.entries()) {
    size++;
    if (Date.now() > entry.expiresAt) {
      expired++;
    }
  }

  return {
    totalEntries: size,
    expiredEntries: expired,
    activeEntries: size - expired,
  };
}
