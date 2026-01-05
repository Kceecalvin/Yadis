import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'monthly'; // daily, weekly, monthly

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        const day = now.getDay();
        startDate.setDate(now.getDate() - day);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
      default:
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
    }

    // Get all orders within the date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    // Get all categories
    const foodCategories = await prisma.category.findMany({
      where: { section: 'FOOD' },
    });

    const householdCategories = await prisma.category.findMany({
      where: { section: 'HOUSEHOLD' },
    });

    // Calculate revenues by section
    let foodRevenue = 0;
    let householdRevenue = 0;
    const productSales: Record<string, { name: string; quantity: number; revenue: number; category: string }> = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productCategory = item.product.category;
        const itemRevenue = item.priceCents * item.quantity;

        // Categorize by section
        if (productCategory.section === 'FOOD') {
          foodRevenue += itemRevenue;
        } else if (productCategory.section === 'HOUSEHOLD') {
          householdRevenue += itemRevenue;
        }

        // Track product sales
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.product.nameEn,
            quantity: 0,
            revenue: 0,
            category: productCategory.titleEn,
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += itemRevenue;
      });
    });

    // Sort products by revenue
    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Get top selling items per category
    const topFoodItems = Object.entries(productSales)
      .filter(
        ([, data]) =>
          foodCategories.some((cat) => cat.titleEn === data.category)
      )
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const topHouseholdItems = Object.entries(productSales)
      .filter(
        ([, data]) =>
          householdCategories.some((cat) => cat.titleEn === data.category)
      )
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate total revenue
    const totalRevenue = foodRevenue + householdRevenue;

    // Get category breakdown
    const categoryBreakdown = await Promise.all(
      [...foodCategories, ...householdCategories].map(async (category) => {
        const categoryOrders = orders.filter((order) =>
          order.items.some((item) => item.product.categoryId === category.id)
        );

        const revenue = categoryOrders.reduce(
          (sum, order) =>
            sum +
            order.items.reduce(
              (itemSum, item) =>
                item.product.categoryId === category.id
                  ? itemSum + item.priceCents * item.quantity
                  : itemSum,
              0
            ),
          0
        );

        return {
          name: category.titleEn,
          section: category.section,
          revenue,
          itemCount: categoryOrders.reduce(
            (sum, order) =>
              sum +
              order.items.filter((item) => item.product.categoryId === category.id)
                .length,
            0
          ),
        };
      })
    );

    return NextResponse.json({
      period,
      dateRange: {
        start: startDate,
        end: now,
      },
      summary: {
        totalRevenue,
        foodRevenue,
        householdRevenue,
        totalOrders: orders.length,
        averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      },
      topProducts,
      topFoodItems,
      topHouseholdItems,
      categoryBreakdown,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
