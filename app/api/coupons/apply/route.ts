import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/coupons/apply
 * Apply a coupon to an order and record usage
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { couponId, orderId } = await request.json();

    if (!couponId || !orderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Record coupon usage
    const usage = await prisma.couponUsage.create({
      data: {
        couponId,
        userId: session.user.id,
        orderId,
        discountAmount: 0, // Will be calculated by checkout
      },
    });

    // Update coupon usage count
    await prisma.couponCode.update({
      where: { id: couponId },
      data: { usedCount: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      usage,
      message: 'Coupon applied to order',
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    return NextResponse.json({ error: 'Failed to apply coupon' }, { status: 500 });
  }
}
