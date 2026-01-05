import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only admin users can view promotions
    if (!session?.user?.id || !session.user.isPlatformAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all promotions (coupons)
    const promotions = await prisma.couponCode.findMany({
      orderBy: {
        startDate: 'desc',
      },
    });

    return NextResponse.json({ success: true, promotions });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only admin users can create promotions
    if (!session?.user?.id || !session.user.isPlatformAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { title, description, imageUrl, discountType, discountValue, startDate, endDate, minOrderAmount } = await request.json();

    if (!title || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create promotion as a coupon
    const promotion = await prisma.couponCode.create({
      data: {
        code: title.toUpperCase().replace(/\s+/g, '_'),
        description: description || title,
        discountType,
        discountValue,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        minOrderAmount: minOrderAmount || undefined,
        isActive: true,
      },
    });

    return NextResponse.json(
      { success: true, promotion, message: 'Promotion created successfully!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating promotion:', error);
    return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 });
  }
}
