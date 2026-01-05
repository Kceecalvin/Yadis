import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { getRewardsStoreItems } from '@/lib/points-service';

/**
 * GET /api/gamification/rewards-store
 * Get available rewards in the store
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;

    const rewards = await getRewardsStoreItems(category);

    return NextResponse.json({
      success: true,
      rewards: rewards.map((reward) => ({
        id: reward.id,
        name: reward.name,
        description: reward.description,
        imageUrl: reward.imageUrl,
        pointsCost: reward.pointsCost,
        type: reward.type,
        value: reward.value,
        stock: reward.stock,
        category: reward.category,
        isFeatured: reward.isFeatured,
      })),
      categories: ['DISCOUNTS', 'DELIVERIES', 'PRODUCTS', 'SPECIAL'],
    });
  } catch (error) {
    console.error('Get rewards store error:', error);
    return NextResponse.json(
      { error: 'Failed to get rewards store' },
      { status: 500 }
    );
  }
}
