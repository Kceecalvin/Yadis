import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { getPointsHistory } from '@/lib/points-service';

/**
 * GET /api/gamification/points/history
 * Get detailed points transaction history
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const type = searchParams.get('type'); // Filter by type

    let history = await getPointsHistory(session.user.id, limit);

    // Filter by type if specified
    if (type) {
      history = history.filter((tx) => tx.type === type);
    }

    return NextResponse.json({
      success: true,
      history: history.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        balance: tx.balance,
        description: tx.description,
        metadata: tx.metadata,
        createdAt: tx.createdAt,
      })),
      count: history.length,
    });
  } catch (error) {
    console.error('Get points history error:', error);
    return NextResponse.json(
      { error: 'Failed to get points history' },
      { status: 500 }
    );
  }
}
