/**
 * Rate Limiting Middleware
 * Protects APIs from abuse and DDoS attacks
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // in milliseconds
  message?: string;
  statusCode?: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (use Redis in production)
const rateLimitStore: RateLimitStore = {};

/**
 * Create a rate limiter middleware
 */
export function createRateLimiter(config: RateLimitConfig) {
  const {
    maxRequests = 100,
    windowMs = 15 * 60 * 1000, // 15 minutes default
    message = 'Too many requests, please try again later',
    statusCode = 429,
  } = config;

  return async (request: NextRequest) => {
    const identifier = getIdentifier(request);
    const now = Date.now();

    // Get or create rate limit entry
    if (!rateLimitStore[identifier]) {
      rateLimitStore[identifier] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    const entry = rateLimitStore[identifier];

    // Reset if window expired
    if (now > entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + windowMs;
    }

    entry.count++;

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      return new NextResponse(
        JSON.stringify({
          error: message,
          retryAfter: Math.ceil((entry.resetTime - now) / 1000),
        }),
        {
          status: statusCode,
          headers: {
            'Retry-After': Math.ceil((entry.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString(),
          },
        }
      );
    }

    // Return response with rate limit headers
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', (maxRequests - entry.count).toString());
    response.headers.set('X-RateLimit-Reset', entry.resetTime.toString());

    return response;
  };
}

/**
 * Get identifier from request (IP or user ID)
 */
function getIdentifier(request: NextRequest): string {
  // Try to get from header first (for proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  // Fall back to connection IP
  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Per-route rate limiters
 */

export const loginRateLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many login attempts, please try again later',
});

export const registerRateLimiter = createRateLimiter({
  maxRequests: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many registration attempts, please try again later',
});

export const passwordResetRateLimiter = createRateLimiter({
  maxRequests: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many password reset attempts, please try again later',
});

export const apiRateLimiter = createRateLimiter({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'API rate limit exceeded',
});

export const paymentRateLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many payment attempts, please try again later',
});

export const searchRateLimiter = createRateLimiter({
  maxRequests: 60,
  windowMs: 60 * 1000, // 1 minute
  message: 'Search rate limit exceeded',
});

/**
 * Sliding window rate limiter (more sophisticated)
 */
export class SlidingWindowRateLimiter {
  private store: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.store.get(identifier) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);

    if (validRequests.length < this.maxRequests) {
      validRequests.push(now);
      this.store.set(identifier, validRequests);
      return true;
    }

    return false;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const requests = this.store.get(identifier) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  getResetTime(identifier: string): number {
    const requests = this.store.get(identifier) || [];
    if (requests.length === 0) return 0;

    const oldestRequest = Math.min(...requests);
    return oldestRequest + this.windowMs;
  }
}

/**
 * Token bucket rate limiter
 */
export class TokenBucketRateLimiter {
  private store: Map<string, { tokens: number; lastRefill: number }> = new Map();
  private capacity: number;
  private refillRate: number; // tokens per second

  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity;
    this.refillRate = refillRate;
  }

  isAllowed(identifier: string, tokensRequired: number = 1): boolean {
    const now = Date.now() / 1000; // Convert to seconds
    let bucket = this.store.get(identifier);

    if (!bucket) {
      bucket = { tokens: this.capacity, lastRefill: now };
      this.store.set(identifier, bucket);
    }

    // Calculate tokens to add based on time elapsed
    const timePassed = now - bucket.lastRefill;
    bucket.tokens = Math.min(
      this.capacity,
      bucket.tokens + timePassed * this.refillRate
    );
    bucket.lastRefill = now;

    if (bucket.tokens >= tokensRequired) {
      bucket.tokens -= tokensRequired;
      return true;
    }

    return false;
  }
}

/**
 * Clean up expired entries (should be called periodically)
 */
export function cleanupRateLimitStore(expirationTime: number = 60 * 60 * 1000) {
  const now = Date.now();

  for (const [key, value] of Object.entries(rateLimitStore)) {
    if (now - value.resetTime > expirationTime) {
      delete rateLimitStore[key];
    }
  }
}

/**
 * Get rate limit status for identifier
 */
export function getRateLimitStatus(identifier: string, config: RateLimitConfig) {
  const entry = rateLimitStore[identifier];
  const now = Date.now();

  if (!entry) {
    return {
      count: 0,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      resetTime: now + config.windowMs,
      resetIn: config.windowMs,
    };
  }

  return {
    count: entry.count,
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: entry.resetTime,
    resetIn: Math.max(0, entry.resetTime - now),
  };
}
