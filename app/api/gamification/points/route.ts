import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { getUserPoints, getPointsHistory } from '@/lib/points-service';

/**
 * GET /api/gamification/points
 * Get user's points balance and recent history
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const historyLimit = parseInt(searchParams.get('historyLimit') || '20');

    const [points, history] = await Promise.all([
      getUserPoints(session.user.id),
      getPointsHistory(session.user.id, historyLimit),
    ]);

    return NextResponse.json({
      success: true,
      points: {
        total: points.totalPoints,
        available: points.availablePoints,
        used: points.usedPoints,
      },
      history: history.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        balance: tx.balance,
        description: tx.description,
        createdAt: tx.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get points error:', error);
    return NextResponse.json(
      { error: 'Failed to get points' },
      { status: 500 }
    );
  }
}
