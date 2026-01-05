/**
 * Analytics Service
 * Provides analytics and business metrics
 */

import { prisma } from './db';

/**
 * Record product interaction (view, click, add to cart, etc.)
 */
export async function recordProductInteraction(
  userId: string,
  productId: string,
  actionType: 'VIEW' | 'CLICK' | 'ADD_TO_CART' | 'PURCHASE' | 'WISHLIST'
) {
  try {
    const existing = await prisma.userInteraction.findUnique({
      where: {
        userId_productId_actionType: {
          userId,
          productId,
          actionType,
        },
      },
    });

    if (existing) {
      // Update existing interaction
      return await prisma.userInteraction.update({
        where: {
          userId_productId_actionType: {
            userId,
            productId,
            actionType,
          },
        },
        data: {
          actionCount: { increment: 1 },
          lastActionAt: new Date(),
        },
      });
    } else {
      // Create new interaction
      return await prisma.userInteraction.create({
        data: {
          user: { connect: { id: userId } },
          product: { connect: { id: productId } },
          actionType,
          actionCount: 1,
        },
      });
    }
  } catch (error) {
    console.error('Error recording interaction:', error);
  }
}

/**
 * Get product analytics for a specific date
 */
export async function getProductAnalyticsForDate(productId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const interactions = await prisma.userInteraction.groupBy({
    by: ['actionType'],
    where: {
      productId,
      lastActionAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    _count: true,
  });

  const sales = await prisma.orderItem.findMany({
    where: {
      productId,
      order: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    },
  });

  const revenue = sales.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  return {
    views: interactions.find(i => i.actionType === 'VIEW')?._count || 0,
    clicks: interactions.find(i => i.actionType === 'CLICK')?._count || 0,
    addToCart: interactions.find(i => i.actionType === 'ADD_TO_CART')?._count || 0,
    purchases: sales.length,
    revenue,
  };
}

/**
 * Get order analytics
 */
export async function getOrderAnalytics(startDate: Date, endDate: Date) {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      items: true,
    },
  });

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalCents, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Get unique customer count
  const uniqueCustomers = new Set(orders.map(o => o.userId).filter(Boolean));

  return {
    totalOrders,
    totalRevenue,
    averageOrderValue,
    uniqueCustomers: uniqueCustomers.size,
    ordersPerDay: totalOrders / Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
  };
}

/**
 * Get top products by revenue
 */
export async function getTopProductsByRevenue(limit: number = 10, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      p.id,
      p."nameEn",
      p."priceCents",
      COUNT(oi.id) as sale_count,
      SUM(oi.quantity) as total_quantity,
      SUM(oi."priceCents" * oi.quantity) as total_revenue
    FROM "Product" p
    LEFT JOIN "OrderItem" oi ON p.id = oi."productId"
    LEFT JOIN "Order" o ON oi."orderId" = o.id
    WHERE o."createdAt" >= ${startDate}
    GROUP BY p.id
    ORDER BY total_revenue DESC
    LIMIT ${limit}
  `;

  return result;
}

/**
 * Get top products by views
 */
export async function getTopProductsByViews(limit: number = 10, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      p.id,
      p."nameEn",
      COUNT(ui.id) as view_count,
      SUM(CASE WHEN ui."actionType" = 'ADD_TO_CART' THEN 1 ELSE 0 END) as add_to_cart_count,
      SUM(CASE WHEN ui."actionType" = 'PURCHASE' THEN 1 ELSE 0 END) as purchase_count
    FROM "Product" p
    LEFT JOIN "UserInteraction" ui ON p.id = ui."productId"
    WHERE ui."lastActionAt" >= ${startDate}
    GROUP BY p.id
    ORDER BY view_count DESC
    LIMIT ${limit}
  `;

  return result;
}

/**
 * Get customer acquisition metrics
 */
export async function getCustomerMetrics(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const newCustomers = await prisma.user.count({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
  });

  const totalCustomers = await prisma.user.count();

  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
  });

  const uniqueOrderingCustomers = new Set(orders.map(o => o.userId).filter(Boolean)).size;

  const avgOrdersPerCustomer = uniqueOrderingCustomers > 0 ? orders.length / uniqueOrderingCustomers : 0;

  return {
    newCustomers,
    totalCustomers,
    returningCustomers: totalCustomers - newCustomers,
    customersWithOrders: uniqueOrderingCustomers,
    avgOrdersPerCustomer,
  };
}

/**
 * Get conversion metrics
 */
export async function getConversionMetrics(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const views = await prisma.userInteraction.count({
    where: {
      actionType: 'VIEW',
      lastActionAt: {
        gte: startDate,
      },
    },
  });

  const addToCart = await prisma.userInteraction.count({
    where: {
      actionType: 'ADD_TO_CART',
      lastActionAt: {
        gte: startDate,
      },
    },
  });

  const purchases = await prisma.userInteraction.count({
    where: {
      actionType: 'PURCHASE',
      lastActionAt: {
        gte: startDate,
      },
    },
  });

  return {
    viewToAddCart: views > 0 ? (addToCart / views) * 100 : 0,
    viewToPurchase: views > 0 ? (purchases / views) * 100 : 0,
    cartToPurchase: addToCart > 0 ? (purchases / addToCart) * 100 : 0,
  };
}

/**
 * Get category performance
 */
export async function getCategoryPerformance(limit: number = 10, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      c.id,
      c."titleEn",
      COUNT(oi.id) as order_count,
      SUM(oi."priceCents" * oi.quantity) as revenue,
      COUNT(DISTINCT o."userId") as customer_count
    FROM "Category" c
    LEFT JOIN "Product" p ON c.id = p."categoryId"
    LEFT JOIN "OrderItem" oi ON p.id = oi."productId"
    LEFT JOIN "Order" o ON oi."orderId" = o.id
    WHERE o."createdAt" >= ${startDate}
    GROUP BY c.id
    ORDER BY revenue DESC
    LIMIT ${limit}
  `;

  return result;
}

export default {
  recordProductInteraction,
  getProductAnalyticsForDate,
  getOrderAnalytics,
  getTopProductsByRevenue,
  getTopProductsByViews,
  getCustomerMetrics,
  getConversionMetrics,
  getCategoryPerformance,
};
