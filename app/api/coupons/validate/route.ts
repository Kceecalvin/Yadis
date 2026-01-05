import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/coupons/validate
 * Validate and apply a coupon code to an order
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, orderAmount } = await request.json();

    if (!code || !orderAmount) {
      return NextResponse.json({ error: 'Code and order amount required' }, { status: 400 });
    }

    // Find coupon
    const coupon = await prisma.couponCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
    }

    // Check if active
    const now = new Date();
    if (!coupon.isActive || now < coupon.startDate || now > coupon.endDate) {
      return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });
    }

    // Check min order amount
    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      return NextResponse.json({
        error: `Minimum order amount is KES ${(coupon.minOrderAmount / 100).toFixed(2)}`,
      }, { status: 400 });
    }

    // Check global usage limit
    if (coupon.maxUsesGlobal && coupon.usedCount >= coupon.maxUsesGlobal) {
      return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
    }

    // Check per-user usage limit
    if (coupon.maxUsesPerUser) {
      const userUsageCount = await prisma.couponUsage.count({
        where: {
          couponId: coupon.id,
          userId: session.user.id,
        },
      });

      if (userUsageCount >= coupon.maxUsesPerUser) {
        return NextResponse.json({
          error: `You can only use this coupon ${coupon.maxUsesPerUser} time(s)`,
        }, { status: 400 });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.floor((orderAmount * coupon.discountValue) / 100);
    } else {
      discountAmount = coupon.discountValue;
    }

    const finalAmount = Math.max(0, orderAmount - discountAmount);

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discount: {
        originalAmount: orderAmount,
        discountAmount,
        finalAmount,
        savings: discountAmount,
      },
      message: `Coupon applied! You save KES ${(discountAmount / 100).toFixed(2)}`,
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}
