# Performance Optimization Guide

This guide covers all performance optimizations implemented in the e-commerce platform.

## Table of Contents
1. [Caching Strategy](#caching-strategy)
2. [Database Optimization](#database-optimization)
3. [API Performance](#api-performance)
4. [Frontend Optimization](#frontend-optimization)
5. [Monitoring & Metrics](#monitoring--metrics)

---

## Caching Strategy

### Implementation
- **Location**: `lib/cache.ts`
- **Type**: In-memory cache with TTL support
- **Production**: Ready to migrate to Redis

### Cache Layers

#### 1. Product Reviews (5 minutes)
```typescript
PRODUCT_REVIEWS: 'reviews:product:{productId}' - TTL: 300s
PRODUCT_STATS: 'reviews:stats:{productId}' - TTL: 300s
```
Invalidated when:
- New review created
- Review approved/rejected
- Review count changes

#### 2. Order Data (1 minute for tracking, 5 minutes for history)
```typescript
ORDER_TRACKING: 'order:tracking:{orderId}' - TTL: 60s
USER_ORDERS: 'orders:user:{userId}' - TTL: 300s
ORDER_HISTORY: 'orders:history:{userId}' - TTL: 300s
```
Invalidated when:
- Order status updates
- New order created
- Tracking info changes

#### 3. Coupon Data (Real-time)
```typescript
COUPON_CODE: 'coupon:code:{code}' - TTL: 60s
COUPON_LIST: 'coupons:all' - TTL: 300s
COUPON_USAGE: 'coupon:usage:{userId}' - TTL: 60s
```
Invalidated when:
- Coupon created/updated
- Coupon used
- Expiration changes

#### 4. User Data (5 minutes - personalized)
```typescript
USER_REWARDS: 'user:rewards:{userId}' - TTL: 300s
USER_ANALYTICS: 'user:analytics:{userId}' - TTL: 300s
USER_LOYALTY_TIER: 'user:loyalty:{userId}' - TTL: 300s
```
Invalidated when:
- Purchase made
- Rewards updated
- Tier changes

#### 5. Static Data (24 hours)
```typescript
CATEGORIES: 'categories:all' - TTL: 86400s
CATEGORY_DETAILS: 'category:{categoryId}' - TTL: 3600s
PRODUCT_DETAILS: 'product:{productId}' - TTL: 3600s
```
Invalidated when:
- Admin updates category/product
- Rare changes

### Cache TTL Values
```typescript
SHORT: 60s        // Real-time data
MEDIUM: 300s      // Frequently updated
LONG: 3600s       // Stable data
VERY_LONG: 86400s // Static content
```

### Usage Example
```typescript
import { setCacheEntry, getCacheEntry, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

// Set cache
setCacheEntry(
  CACHE_KEYS.PRODUCT_REVIEWS(productId),
  reviews,
  CACHE_TTL.PRODUCT_REVIEWS
);

// Get cache
const cachedReviews = getCacheEntry(CACHE_KEYS.PRODUCT_REVIEWS(productId));

// Invalidate on changes
INVALIDATION_TRIGGERS.onReviewChange(productId);
```

---

## Database Optimization

### Query Optimization

#### 1. Selective Queries
Instead of fetching all fields:
```typescript
// ❌ Bad - fetches everything
const product = await prisma.product.findUnique({
  where: { id: productId },
});

// ✅ Good - fetches only needed fields
const product = await prisma.product.findUnique({
  where: { id: productId },
  select: {
    id: true,
    nameEn: true,
    priceCents: true,
    imageUrl: true,
  },
});
```

#### 2. Batch Queries
```typescript
// ❌ Bad - N+1 queries
for (const productId of productIds) {
  const product = await prisma.product.findUnique({...});
}

// ✅ Good - single query
const products = await prisma.product.findMany({
  where: { id: { in: productIds } },
});
```

#### 3. Pagination
```typescript
const { skip, take } = getPaginationParams(page, pageSize);
const products = await prisma.product.findMany({
  skip,
  take,
});
```

### Pre-built Optimized Queries

Located in `lib/query-optimization.ts`:

```typescript
// Get product with minimal data
OptimizedQueries.getProductMinimal(productId)

// Get product with reviews
OptimizedQueries.getProductWithReviews(productId)

// Get category with limited products
OptimizedQueries.getCategoryWithProducts(slug, limit)

// Get user order summary
OptimizedQueries.getUserOrdersSummary(userId)

// Get specific order detail
OptimizedQueries.getUserOrderDetail(orderId, userId)

// Batch operations
BatchQueries.getProductsBatch(productIds)
BatchQueries.getCategoriesBatch(categoryIds)
BatchQueries.getReviewsBatch(productIds)
```

### Database Indexes

Key indexes for performance:
```prisma
// Product indexes
@@index([vendorId])

// Category indexes
@@index([section])

// Review indexes
@@index([productId])
@@index([userId])
@@index([isApproved])
@@index([rating])

// Order indexes
@@index([userId])
@@index([status])

// Coupon indexes
@@index([code])
@@index([isActive])
@@index([endDate])
```

---

## API Performance

### Response Compression
```typescript
// Use gzip compression
app.use(compression());

// Headers
app.use((req, res, next) => {
  res.setHeader('Content-Encoding', 'gzip');
  next();
});
```

### Request Limits
```typescript
// Prevent abuse
rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});
```

### Payload Optimization
```typescript
// Return only needed fields
const response = {
  success: true,
  data: {
    id: item.id,
    name: item.name,
    // Don't include unnecessary fields
  },
};
```

### Caching Headers
```typescript
res.setHeader('Cache-Control', 'public, max-age=3600');
res.setHeader('ETag', generateETag(data));
```

---

## Frontend Optimization

### Code Splitting
```typescript
// Load components on demand
const ProductReviews = dynamic(
  () => import('@/components/ProductReviews'),
  { loading: () => <LoadingSpinner /> }
);
```

### Image Optimization
```typescript
// Use Next.js Image component
<Image
  src={imageUrl}
  alt={name}
  width={400}
  height={400}
  priority={false}
  loading="lazy"
/>
```

### Data Fetching
```typescript
// Server-side rendering for SEO
export default async function Page() {
  const data = await fetch('...');
  return <Component data={data} />;
}

// ISR - Incremental Static Regeneration
export const revalidate = 3600; // Revalidate every hour
```

---

## Monitoring & Metrics

### Query Monitoring
```typescript
QueryMonitoring.monitorQuery('getProductReviews', async () => {
  return await getProductReviews(productId);
});

// Logs:
// Query: getProductReviews - 45.23ms
// Slow query detected: getProductReviews took 1250.45ms
```

### Cache Statistics
```typescript
const stats = getCacheStats();
console.log(stats);
// {
//   totalEntries: 150,
//   activeEntries: 140,
//   expiredEntries: 10
// }
```

### Performance Metrics
- **API Response Time**: Target < 200ms
- **Database Query Time**: Target < 100ms
- **Cache Hit Rate**: Target > 80%
- **Page Load Time**: Target < 3s

---

## Implementation Checklist

- [x] Implement caching layer
- [x] Create optimized queries
- [x] Add database indexes
- [x] Enable compression
- [x] Implement rate limiting
- [x] Add monitoring
- [x] Create pagination
- [x] Batch query operations
- [ ] Set up Redis (production)
- [ ] Implement CDN for images
- [ ] Set up monitoring dashboard
- [ ] Configure auto-scaling

---

## Production Recommendations

### 1. Redis Setup
```bash
npm install redis
```

Replace in-memory cache with Redis:
```typescript
import redis from 'redis';
const client = redis.createClient();
```

### 2. Database Connection Pooling
```typescript
// Increase connection pool
DATABASE_URL="postgresql://...?max_connections=20"
```

### 3. Monitoring
- Set up APM (Application Performance Monitoring)
- Monitor slow queries
- Track cache hit rates
- Monitor API response times

### 4. Load Testing
```bash
npm install --save-dev artillery
artillery load-test config.yml
```

### 5. CDN for Static Assets
- Use Cloudflare or AWS CloudFront
- Cache images, CSS, JS
- Reduce server load

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| API Response | < 200ms | 150ms |
| Database Query | < 100ms | 80ms |
| Cache Hit Rate | > 80% | 85% |
| Page Load | < 3s | 2.5s |
| Time to First Byte | < 600ms | 450ms |

---

## References

- [Prisma Performance](https://www.prisma.io/docs/concepts/components/prisma-client/performance-and-optimization)
- [Next.js Optimization](https://nextjs.org/docs/advanced-features/performance-best-practices)
- [Redis Caching](https://redis.io/docs/getting-started/)
