import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { getUserRedemptions } from '@/lib/points-service';

/**
 * GET /api/gamification/rewards-store/my-redemptions
 * Get user's redemption history
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const redemptions = await getUserRedemptions(session.user.id);

    return NextResponse.json({
      success: true,
      redemptions: redemptions.map((redemption) => ({
        id: redemption.id,
        reward: {
          name: redemption.reward.name,
          description: redemption.reward.description,
          type: redemption.reward.type,
          value: redemption.reward.value,
        },
        pointsSpent: redemption.pointsSpent,
        status: redemption.status,
        code: redemption.code,
        expiresAt: redemption.expiresAt,
        createdAt: redemption.createdAt,
        fulfilledAt: redemption.fulfilledAt,
      })),
    });
  } catch (error) {
    console.error('Get redemptions error:', error);
    return NextResponse.json(
      { error: 'Failed to get redemptions' },
      { status: 500 }
    );
  }
}
