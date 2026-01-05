import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import {
  getOrderAnalytics,
  getTopProductsByRevenue,
  getTopProductsByViews,
  getCustomerMetrics,
  getConversionMetrics,
  getCategoryPerformance,
} from '@/lib/analytics';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    
    // Check if user is admin
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user?.isPlatformAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const endDate = new Date();

    // Get all analytics in parallel
    const [
      orderMetrics,
      topProducts,
      topViewedProducts,
      customerMetrics,
      conversionMetrics,
      categoryPerformance,
    ] = await Promise.all([
      getOrderAnalytics(startDate, endDate),
      getTopProductsByRevenue(10, days),
      getTopProductsByViews(10, days),
      getCustomerMetrics(days),
      getConversionMetrics(days),
      getCategoryPerformance(10, days),
    ]);

    // Get total inventory value
    const inventoryStats = await prisma.$queryRaw<any[]>`
      SELECT 
        SUM(i.quantity) as total_quantity,
        SUM(i.quantity * p."priceCents") as total_value,
        SUM(i."available") as available_quantity,
        SUM(i.reserved) as reserved_quantity,
        COUNT(i.id) as product_count
      FROM "Inventory" i
      LEFT JOIN "Product" p ON i."productId" = p.id
    `;

    // Get review statistics
    const reviewStats = await prisma.productReview.aggregate({
      _count: true,
      _avg: {
        rating: true,
      },
      where: {
        isApproved: true,
      },
    });

    // Get coupon statistics
    const couponStats = await prisma.couponCode.aggregate({
      _count: true,
      where: {
        isActive: true,
      },
    });

    const couponUsage = await prisma.couponUsage.count();

    return NextResponse.json({
      period: {
        startDate,
        endDate,
        days,
      },
      orders: orderMetrics,
      customers: customerMetrics,
      conversions: conversionMetrics,
      inventory: inventoryStats[0] || {},
      reviews: {
        total: reviewStats._count,
        averageRating: reviewStats._avg.rating || 0,
      },
      coupons: {
        active: couponStats._count,
        totalUsages: couponUsage,
      },
      topProducts,
      topViewedProducts,
      categoryPerformance,
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
