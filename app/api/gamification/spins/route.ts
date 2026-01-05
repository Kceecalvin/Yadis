import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

/**
 * GET /api/gamification/spins
 * Get user's available spins
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userSpins = await prisma.userSpins.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      success: true,
      spinsAvailable: userSpins?.spinsAvailable || 0,
      totalSpins: userSpins?.totalSpins || 0,
    });
  } catch (error) {
    console.error('Get spins error:', error);
    return NextResponse.json(
      { error: 'Failed to get spins' },
      { status: 500 }
    );
  }
}
