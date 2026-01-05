import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { redeemReward } from '@/lib/points-service';

/**
 * POST /api/gamification/rewards-store/redeem
 * Redeem a reward with points
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rewardId } = await request.json();

    if (!rewardId) {
      return NextResponse.json(
        { error: 'Reward ID required' },
        { status: 400 }
      );
    }

    const redemption = await redeemReward(session.user.id, rewardId);

    return NextResponse.json({
      success: true,
      redemption: {
        id: redemption.id,
        pointsSpent: redemption.pointsSpent,
        code: redemption.code,
        expiresAt: redemption.expiresAt,
        createdAt: redemption.createdAt,
      },
      message: 'Reward redeemed successfully!',
    });
  } catch (error: any) {
    console.error('Redeem reward error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to redeem reward' },
      { status: 400 }
    );
  }
}
