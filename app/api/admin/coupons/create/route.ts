import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/coupons/create
 * Create a new coupon (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.isPlatformAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxUsesGlobal,
      maxUsesPerUser,
      startDate,
      endDate,
    } = await request.json();

    // Validate
    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if code already exists
    const existing = await prisma.couponCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    }

    // Create coupon
    const coupon = await prisma.couponCode.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue,
        minOrderAmount: minOrderAmount || undefined,
        maxUsesGlobal: maxUsesGlobal || undefined,
        maxUsesPerUser: maxUsesPerUser || undefined,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        coupon,
        message: 'Coupon created successfully!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}
