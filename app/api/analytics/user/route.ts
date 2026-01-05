import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/analytics/user
 * Get user's analytics and insights
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

    // Get order data
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: { include: { product: { select: { categoryId: true } } } } },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate metrics
    const totalPurchases = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalCents, 0);
    const averageOrderValue = totalPurchases > 0 ? Math.round(totalSpent / totalPurchases) : 0;

    const lastPurchaseDate = orders[0]?.createdAt;
    const daysSinceLastPurchase = lastPurchaseDate
      ? Math.floor((Date.now() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Find favorite category
    const categoryCount: Record<string, number> = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        categoryCount[item.product.categoryId] = (categoryCount[item.product.categoryId] || 0) + 1;
      });
    });

    const favoriteCategory = Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0]?.[0];

    // Determine churn risk (no purchase in 60 days)
    const churnRisk = daysSinceLastPurchase ? daysSinceLastPurchase > 60 : false;
    const isActive = !churnRisk && totalPurchases > 0;

    // Update analytics
    await prisma.customerAnalytics.update({
      where: { userId: session.user.id },
      data: {
        totalPurchases,
        totalSpent,
        averageOrderValue,
        lastPurchaseDate: lastPurchaseDate || undefined,
        daysSinceLastPurchase,
        favoriteCategory: favoriteCategory || undefined,
        churnRisk,
        isActive,
      },
    });

    return NextResponse.json({
      success: true,
      analytics: {
        totalPurchases,
        totalSpent,
        averageOrderValue,
        lastPurchaseDate,
        daysSinceLastPurchase,
        favoriteCategory,
        churnRisk,
        isActive,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
