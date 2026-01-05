import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/coupons
 * Get all coupons (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.isPlatformAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const coupons = await prisma.couponCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: { usages: { select: { id: true } } },
    });

    return NextResponse.json({
      success: true,
      coupons: coupons.map((c) => ({
        ...c,
        usages: undefined,
        usedCount: c.usedCount || c.usages?.length || 0,
      })),
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}
