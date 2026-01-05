/**
 * Database Query Optimization Utilities
 * Implements best practices for Prisma queries
 */

import { prisma } from './db';

/**
 * Optimized product queries with selective includes
 */
export const OptimizedQueries = {
  /**
   * Get product with minimal data
   */
  async getProductMinimal(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        slug: true,
        nameEn: true,
        priceCents: true,
        imageUrl: true,
        inStock: true,
      },
    });
  },

  /**
   * Get product with reviews
   */
  async getProductWithReviews(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        nameEn: true,
        priceCents: true,
        imageUrl: true,
        reviews: {
          where: { isApproved: true },
          select: {
            id: true,
            rating: true,
            title: true,
            user: { select: { name: true, image: true } },
            createdAt: true,
          },
          take: 10,
        },
      },
    });
  },

  /**
   * Get category with minimal products
   */
  async getCategoryWithProducts(categorySlug: string, limit: number = 12) {
    return prisma.category.findUnique({
      where: { slug: categorySlug },
      select: {
        id: true,
        titleEn: true,
        products: {
          select: {
            id: true,
            slug: true,
            nameEn: true,
            priceCents: true,
            imageUrl: true,
          },
          take: limit,
        },
      },
    });
  },

  /**
   * Get user orders without full items list
   */
  async getUserOrdersSummary(userId: string, limit: number = 20) {
    return prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        totalCents: true,
        status: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  /**
   * Get user order with all details
   */
  async getUserOrderDetail(orderId: string, userId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        totalCents: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            priceCents: true,
            product: {
              select: {
                nameEn: true,
                imageUrl: true,
              },
            },
          },
        },
        tracking: {
          select: {
            status: true,
            estimatedDeliveryDate: true,
            notes: true,
          },
        },
      },
    });
  },
};

/**
 * Batch query operations for better performance
 */
export const BatchQueries = {
  /**
   * Get multiple products efficiently
   */
  async getProductsBatch(productIds: string[]) {
    if (productIds.length === 0) return [];

    return prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        nameEn: true,
        priceCents: true,
        imageUrl: true,
        inStock: true,
      },
    });
  },

  /**
   * Get multiple categories efficiently
   */
  async getCategoriesBatch(categoryIds: string[]) {
    if (categoryIds.length === 0) return [];

    return prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: {
        id: true,
        titleEn: true,
        slug: true,
      },
    });
  },

  /**
   * Get multiple reviews efficiently
   */
  async getReviewsBatch(productIds: string[]) {
    if (productIds.length === 0) return {};

    const reviews = await prisma.productReview.findMany({
      where: {
        productId: { in: productIds },
        isApproved: true,
      },
      select: {
        productId: true,
        rating: true,
        title: true,
      },
    });

    // Group by productId
    const grouped: Record<string, any[]> = {};
    for (const review of reviews) {
      if (!grouped[review.productId]) {
        grouped[review.productId] = [];
      }
      grouped[review.productId].push(review);
    }

    return grouped;
  },
};

/**
 * Pagination helpers
 */
export const Pagination = {
  /**
   * Calculate skip value
   */
  getSkip(page: number = 1, pageSize: number = 20): number {
    return (page - 1) * pageSize;
  },

  /**
   * Get paginated results
   */
  async getPaginatedResults<T>(
    query: Promise<T[]>,
    countQuery: Promise<number>,
    page: number = 1,
    pageSize: number = 20
  ) {
    const [items, total] = await Promise.all([query, countQuery]);

    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: page < Math.ceil(total / pageSize),
        hasPreviousPage: page > 1,
      },
    };
  },
};

/**
 * Aggregation helpers
 */
export const Aggregations = {
  /**
   * Get review statistics for product
   */
  async getReviewStats(productId: string) {
    const reviews = await prisma.productReview.findMany({
      where: { productId, isApproved: true },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    for (const review of reviews) {
      sum += review.rating;
      distribution[review.rating as keyof typeof distribution]++;
    }

    return {
      totalReviews: reviews.length,
      averageRating: sum / reviews.length,
      distribution,
    };
  },

  /**
   * Get user spending summary
   */
  async getUserSpendingSummary(userId: string) {
    const orders = await prisma.order.findMany({
      where: { userId },
      select: { totalCents: true, createdAt: true },
    });

    if (orders.length === 0) {
      return {
        totalSpent: 0,
        averageOrderValue: 0,
        orderCount: 0,
        lastPurchaseDate: null,
      };
    }

    const totalSpent = orders.reduce((sum, order) => sum + order.totalCents, 0);

    return {
      totalSpent: totalSpent / 100,
      averageOrderValue: totalSpent / orders.length / 100,
      orderCount: orders.length,
      lastPurchaseDate: new Date(Math.max(...orders.map((o) => o.createdAt.getTime()))),
    };
  },
};

/**
 * Connection pooling configuration
 */
export const ConnectionPool = {
  config: {
    maxConnections: 10,
    minConnections: 2,
    connectionTimeoutMs: 5000,
    idleTimeoutMs: 600000, // 10 minutes
  },
};

/**
 * Query monitoring
 */
export const QueryMonitoring = {
  slowQueryThresholdMs: 1000,
  enableQueryLogging: process.env.NODE_ENV === 'development',

  async monitorQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();

    try {
      const result = await queryFn();
      const duration = performance.now() - startTime;

      if (duration > this.slowQueryThresholdMs) {
        console.warn(
          `Slow query detected: ${queryName} took ${duration.toFixed(2)}ms`
        );
      }

      if (this.enableQueryLogging) {
        console.log(`Query: ${queryName} - ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(
        `Query failed: ${queryName} after ${duration.toFixed(2)}ms`,
        error
      );
      throw error;
    }
  },
};
