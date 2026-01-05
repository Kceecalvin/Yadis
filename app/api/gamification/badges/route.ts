import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { getUserBadgeProgress } from '@/lib/gamification/badge-checker';

/**
 * GET /api/gamification/badges
 * Get user's badge information
 * Query params: ?type=earned|available|progress
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    switch (type) {
      case 'earned':
        // Get user's earned badges
        const earnedBadges = await prisma.userBadge.findMany({
          where: { userId: session.user.id },
          include: { badge: true },
          orderBy: { earnedAt: 'desc' }
        });

        return NextResponse.json({
          success: true,
          badges: earnedBadges.map(ub => ({
            ...ub.badge,
            earnedAt: ub.earnedAt
          })),
          total: earnedBadges.length
        });

      case 'available':
        // Get badges user hasn't earned yet
        const earnedIds = await prisma.userBadge.findMany({
          where: { userId: session.user.id },
          select: { badgeId: true }
        });

        const availableBadges = await prisma.badge.findMany({
          where: {
            isActive: true,
            id: { notIn: earnedIds.map(e => e.badgeId) }
          },
          orderBy: [
            { category: 'asc' },
            { requirement: 'asc' }
          ]
        });

        return NextResponse.json({
          success: true,
          badges: availableBadges
        });

      case 'progress':
        // Get full progress information
        const progress = await getUserBadgeProgress(session.user.id);

        return NextResponse.json({
          success: true,
          ...progress
        });

      default:
        // Get all badge info
        const allProgress = await getUserBadgeProgress(session.user.id);

        return NextResponse.json({
          success: true,
          earned: allProgress?.earned || [],
          nextBadges: allProgress?.nextBadges || [],
          stats: allProgress?.stats || {}
        });
    }

  } catch (error) {
    console.error('Badges API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gamification/badges/check
 * Manually trigger badge check (usually done automatically)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { checkAndAwardBadges } = await import('@/lib/gamification/badge-checker');
    const newBadges = await checkAndAwardBadges(session.user.id);

    return NextResponse.json({
      success: true,
      newBadges,
      message: newBadges.length > 0 
        ? `🎉 You earned ${newBadges.length} new badge(s)!` 
        : 'No new badges at this time'
    });

  } catch (error) {
    console.error('Badge check error:', error);
    return NextResponse.json(
      { error: 'Failed to check badges' },
      { status: 500 }
    );
  }
}
