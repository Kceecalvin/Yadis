import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

/**
 * GET /api/gamification/contests
 * Get active contests
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const session = await getServerSession(authOptions);

    const now = new Date();

    let contests;

    switch (status) {
      case 'active':
        contests = await prisma.contest.findMany({
          where: {
            isActive: true,
            startDate: { lte: now },
            endDate: { gte: now }
          },
          include: {
            entries: {
              include: {
                user: { select: { id: true, name: true, image: true } }
              },
              orderBy: { score: 'desc' }
            },
            _count: { select: { entries: true } }
          },
          orderBy: { startDate: 'desc' }
        });
        break;

      case 'upcoming':
        contests = await prisma.contest.findMany({
          where: {
            isActive: true,
            startDate: { gt: now }
          },
          include: {
            _count: { select: { entries: true } }
          },
          orderBy: { startDate: 'asc' }
        });
        break;

      case 'ended':
        contests = await prisma.contest.findMany({
          where: {
            endDate: { lt: now }
          },
          include: {
            entries: {
              include: {
                user: { select: { id: true, name: true, image: true } }
              },
              orderBy: { score: 'desc' },
              take: 10
            },
            _count: { select: { entries: true } }
          },
          orderBy: { endDate: 'desc' },
          take: 5
        });
        break;

      default:
        contests = [];
    }

    // Add user participation info if logged in
    const contestsWithUserInfo = await Promise.all(
      contests.map(async (contest) => {
        let userEntry = null;
        let userRank = null;

        if (session?.user?.id) {
          userEntry = await prisma.contestEntry.findUnique({
            where: {
              contestId_userId: {
                contestId: contest.id,
                userId: session.user.id
              }
            }
          });

          if (userEntry) {
            // Calculate user's rank
            const higherScores = await prisma.contestEntry.count({
              where: {
                contestId: contest.id,
                score: { gt: userEntry.score }
              }
            });
            userRank = higherScores + 1;
          }
        }

        return {
          ...contest,
          userEntry,
          userRank,
          isUserParticipating: !!userEntry,
          daysRemaining: Math.max(0, Math.ceil((contest.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        };
      })
    );

    return NextResponse.json({
      success: true,
      contests: contestsWithUserInfo
    });

  } catch (error) {
    console.error('Contests API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contests' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gamification/contests/:id/enter
 * Enter a contest (auto-entry for most contests)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contestId } = await request.json();

    if (!contestId) {
      return NextResponse.json(
        { error: 'Contest ID required' },
        { status: 400 }
      );
    }

    // Check if contest exists and is active
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      include: {
        entries: { where: { userId: session.user.id } }
      }
    });

    if (!contest) {
      return NextResponse.json(
        { error: 'Contest not found' },
        { status: 404 }
      );
    }

    if (!contest.isActive) {
      return NextResponse.json(
        { error: 'Contest is not active' },
        { status: 400 }
      );
    }

    const now = new Date();
    if (now < contest.startDate || now > contest.endDate) {
      return NextResponse.json(
        { error: 'Contest is not running' },
        { status: 400 }
      );
    }

    // Check if already entered
    if (contest.entries.length > 0) {
      return NextResponse.json({
        success: true,
        alreadyEntered: true,
        entry: contest.entries[0],
        message: 'You are already participating in this contest'
      });
    }

    // Calculate initial score based on contest type
    let initialScore = 0;

    switch (contest.type) {
      case 'REFERRAL':
        const referralCodes = await prisma.referralCode.findMany({
          where: { referrerId: session.user.id },
          include: {
            referrals: {
              where: {
                status: 'COMPLETED',
                completedAt: { gte: contest.startDate, lte: contest.endDate }
              }
            }
          }
        });
        initialScore = referralCodes.reduce((sum, code) => sum + code.referrals.length, 0);
        break;

      case 'SPENDING':
        const orders = await prisma.order.aggregate({
          where: {
            userId: session.user.id,
            status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] },
            createdAt: { gte: contest.startDate, lte: contest.endDate }
          },
          _sum: { totalCents: true }
        });
        initialScore = orders._sum.totalCents || 0;
        break;

      case 'ORDERS':
        const orderCount = await prisma.order.count({
          where: {
            userId: session.user.id,
            status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] },
            createdAt: { gte: contest.startDate, lte: contest.endDate }
          }
        });
        initialScore = orderCount;
        break;
    }

    // Create entry
    const entry = await prisma.contestEntry.create({
      data: {
        contestId,
        userId: session.user.id,
        score: initialScore
      }
    });

    return NextResponse.json({
      success: true,
      entry,
      message: '🎉 Successfully entered the contest!'
    });

  } catch (error) {
    console.error('Contest entry error:', error);
    return NextResponse.json(
      { error: 'Failed to enter contest' },
      { status: 500 }
    );
  }
}
