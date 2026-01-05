import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  orderId: string;
}

/**
 * GET /api/orders/tracking/[orderId]
 * Get order tracking information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { orderId } = await params;

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: { select: { nameEn: true, imageUrl: true } } },
        },
        tracking: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check authorization
    if (session?.user?.id !== order.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Timeline
    const timeline = [
      {
        step: 'CONFIRMED',
        label: 'Order Confirmed',
        completed: !!order.tracking?.confirmedAt,
        date: order.tracking?.confirmedAt,
        icon: '✓',
      },
      {
        step: 'PROCESSING',
        label: 'Processing',
        completed: order.tracking?.status !== 'PENDING',
        date: order.tracking?.processingAt,
        icon: '⏳',
      },
      {
        step: 'SHIPPED',
        label: 'Shipped',
        completed: !!order.tracking?.shippedAt,
        date: order.tracking?.shippedAt,
        icon: '🚚',
      },
      {
        step: 'DELIVERED',
        label: 'Delivered',
        completed: order.tracking?.status === 'DELIVERED',
        date: order.tracking?.deliveredAt,
        icon: '📦',
      },
    ];

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        totalCents: order.totalCents,
        status: order.tracking?.status || order.status,
        items: order.items,
      },
      tracking: {
        currentStatus: order.tracking?.status || 'PENDING',
        estimatedDelivery: order.tracking?.estimatedDeliveryDate,
        notes: order.tracking?.notes,
        timeline,
      },
    });
  } catch (error) {
    console.error('Error fetching tracking:', error);
    return NextResponse.json({ error: 'Failed to fetch tracking information' }, { status: 500 });
  }
}
