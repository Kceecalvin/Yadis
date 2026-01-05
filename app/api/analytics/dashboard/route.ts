import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/analytics/dashboard
 * Get personalized analytics for user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create analytics record
    let analytics = await prisma.customerAnalytics.findUnique({
      where: { userId: session.user.id },
    });

    if (!analytics) {
      analytics = await prisma.customerAnalytics.create({
        data: { userId: session.user.id },
      });
    }

    // Calculate additional metrics
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: true },
    });

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalCents, 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Get favorites count
    const favoritesCount = await prisma.favorite.count({
      where: { userId: session.user.id },
    });

    // Get reviews count
    const reviewsCount = await prisma.productReview.count({
      where: { userId: session.user.id },
    });

    // Calculate customer tier
    const spentInKES = totalSpent / 100;
    let tier = 'Bronze';
    if (spentInKES >= 5000) tier = 'Silver';
    if (spentInKES >= 10000) tier = 'Gold';
    if (spentInKES >= 20000) tier = 'Platinum';

    // Get last 12 months spending trend
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, 1);

    const monthlySpending = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        userId: session.user.id,
        createdAt: { gte: twelveMonthsAgo },
      },
      _sum: { totalCents: true },
    });

    return NextResponse.json({
      success: true,
      analytics: {
        totalOrders,
        totalSpent: totalSpent / 100, // Convert to KES
        averageOrderValue: averageOrderValue / 100,
        favoritesCount,
        reviewsCount,
        customerTier: tier,
        lastPurchaseDate: analytics.lastPurchaseDate,
        firstPurchaseDate: analytics.firstPurchaseDate,
      },
      metrics: {
        churnRisk: analytics.churnRisk,
        isActive: analytics.isActive,
        viewCount: analytics.viewCount,
        cartAddCount: analytics.cartAddCount,
        wishlistCount: analytics.wishlistCount,
      },
      trends: {
        monthlySpending: monthlySpending.map((m) => ({
          month: new Date(m.createdAt).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'short',
          }),
          amount: (m._sum.totalCents || 0) / 100,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
