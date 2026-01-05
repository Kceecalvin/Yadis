import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

/**
 * GET /api/gamification/leaderboard
 * Get leaderboard rankings
 * Query params: ?period=weekly|monthly|all_time&category=referrals|spending|orders|points&limit=10
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'ALL_TIME';
    const category = searchParams.get('category') || 'SPENDING';
    const limit = parseInt(searchParams.get('limit') || '10');

    const session = await getServerSession(authOptions);

    // Calculate period dates
    const now = new Date();
    let periodStart: Date;
    let periodEnd = now;

    switch (period.toUpperCase()) {
      case 'WEEKLY':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'MONTHLY':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default: // ALL_TIME
        periodStart = new Date(0);
    }

    // Build leaderboard based on category
    let rankings;

    switch (category.toUpperCase()) {
      case 'REFERRALS':
        // Count completed referrals per user
        const referralCounts = await prisma.referralCode.findMany({
          where: {
            referrals: {
              some: {
                status: 'COMPLETED',
                completedAt: { gte: periodStart, lte: periodEnd }
              }
            }
          },
          include: {
            referrer: { select: { id: true, name: true, email: true, image: true } },
            referrals: {
              where: {
                status: 'COMPLETED',
                completedAt: { gte: periodStart, lte: periodEnd }
              }
            }
          }
        });

        rankings = referralCounts
          .map((code, index) => ({
            rank: index + 1,
            userId: code.referrerId,
            user: code.referrer,
            score: code.referrals.length,
            category: 'REFERRALS'
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
        break;

      case 'SPENDING':
        // Calculate total spending per user
        const userSpending = await prisma.order.groupBy({
          by: ['userId'],
          where: {
            status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] },
            createdAt: { gte: periodStart, lte: periodEnd }
          },
          _sum: { totalCents: true },
          _count: { id: true }
        });

        const spendingWithUsers = await Promise.all(
          userSpending.map(async (us, index) => {
            const user = await prisma.user.findUnique({
              where: { id: us.userId },
              select: { id: true, name: true, email: true, image: true }
            });

            return {
              rank: index + 1,
              userId: us.userId,
              user,
              score: us._sum.totalCents || 0,
              category: 'SPENDING'
            };
          })
        );

        rankings = spendingWithUsers
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map((r, index) => ({ ...r, rank: index + 1 }));
        break;

      case 'ORDERS':
        // Count orders per user
        const orderCounts = await prisma.order.groupBy({
          by: ['userId'],
          where: {
            status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] },
            createdAt: { gte: periodStart, lte: periodEnd }
          },
          _count: { id: true }
        });

        const ordersWithUsers = await Promise.all(
          orderCounts.map(async (oc, index) => {
            const user = await prisma.user.findUnique({
              where: { id: oc.userId },
              select: { id: true, name: true, email: true, image: true }
            });

            return {
              rank: index + 1,
              userId: oc.userId,
              user,
              score: oc._count.id,
              category: 'ORDERS'
            };
          })
        );

        rankings = ordersWithUsers
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map((r, index) => ({ ...r, rank: index + 1 }));
        break;

      case 'POINTS':
        // Get users by total points earned
        const userRewards = await prisma.userRewards.findMany({
          where: {
            pointsEarned: { gt: 0 }
          },
          include: {
            user: { select: { id: true, name: true, email: true, image: true } }
          },
          orderBy: { pointsEarned: 'desc' },
          take: limit
        });

        rankings = userRewards.map((ur, index) => ({
          rank: index + 1,
          userId: ur.userId,
          user: ur.user,
          score: ur.pointsEarned,
          category: 'POINTS'
        }));
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        );
    }

    // Find current user's rank if logged in
    let userRank = null;
    if (session?.user?.id) {
      const userIndex = rankings.findIndex(r => r.userId === session.user.id);
      if (userIndex !== -1) {
        userRank = {
          ...rankings[userIndex],
          isCurrentUser: true
        };
      }
    }

    return NextResponse.json({
      success: true,
      period: period.toUpperCase(),
      category: category.toUpperCase(),
      rankings: rankings.map(r => ({
        ...r,
        isCurrentUser: r.userId === session?.user?.id,
        // Format score based on category
        displayScore: category.toUpperCase() === 'SPENDING' 
          ? `KES ${(r.score / 100).toLocaleString()}`
          : r.score.toLocaleString()
      })),
      userRank,
      totalParticipants: rankings.length
    });

  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gamification/spin/grant
 * Grant spins to a user (admin or automated system)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, spins, reason } = await request.json();

    // For now, allow users to grant spins to themselves via referrals
    // In production, add admin check here

    if (!userId || !spins || spins <= 0) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Grant spins
    const updatedSpins = await prisma.userSpins.upsert({
      where: { userId },
      update: {
        spinsAvailable: { increment: spins }
      },
      create: {
        userId,
        spinsAvailable: spins
      }
    });

    return NextResponse.json({
      success: true,
      spinsAvailable: updatedSpins.spinsAvailable,
      message: `${spins} spin(s) granted!`
    });

  } catch (error) {
    console.error('Grant spins error:', error);
    return NextResponse.json(
      { error: 'Failed to grant spins' },
      { status: 500 }
    );
  }
}
