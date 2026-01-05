import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/orders/user
 * Get authenticated user's order history
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's orders with tracking info
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: { select: { nameEn: true, imageUrl: true } },
          },
        },
        tracking: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Format response
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      totalCents: order.totalCents,
      status: order.tracking?.status || order.status,
      itemCount: order.items.length,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items,
      tracking: order.tracking,
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      total: formattedOrders.length,
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
