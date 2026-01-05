import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import SpinWheel from '../components/gamification/SpinWheel';
import BadgeGrid from '../components/gamification/BadgeGrid';
import Leaderboard from '../components/gamification/Leaderboard';
import Link from 'next/link';

export default async function GamificationPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/gamification');
  }

  // Fetch user's gamification data
  const [userSpins, earnedBadges, nextBadges, leaderboardData, activeContests] = await Promise.all([
    // User spins
    prisma.userSpins.findUnique({
      where: { userId: session.user.id }
    }),

    // Earned badges
    prisma.userBadge.findMany({
      where: { userId: session.user.id },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
      take: 12
    }),

    // Next badges to earn
    (async () => {
      const earned = await prisma.userBadge.findMany({
        where: { userId: session.user.id },
        select: { badgeId: true }
      });

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          orders: { where: { status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] } } },
          referralCodesCreated: {
            include: { referrals: { where: { status: 'COMPLETED' } } }
          }
        }
      });

      if (!user) return [];

      const orderCount = user.orders.length;
      const totalSpent = user.orders.reduce((sum, o) => sum + o.totalCents, 0);
      const totalReferrals = user.referralCodesCreated.reduce((sum, c) => sum + c.referrals.length, 0);

      const availableBadges = await prisma.badge.findMany({
        where: {
          isActive: true,
          id: { notIn: earned.map(e => e.badgeId) },
          category: { in: ['PURCHASE', 'SPENDING', 'REFERRAL'] }
        },
        orderBy: { requirement: 'asc' },
        take: 6
      });

      return availableBadges.map(badge => {
        let current = 0;
        let percentage = 0;

        switch (badge.category) {
          case 'PURCHASE':
            current = orderCount;
            percentage = Math.min((current / badge.requirement) * 100, 100);
            break;
          case 'SPENDING':
            current = totalSpent;
            percentage = Math.min((current / badge.requirement) * 100, 100);
            break;
          case 'REFERRAL':
            current = totalReferrals;
            percentage = Math.min((current / badge.requirement) * 100, 100);
            break;
        }

        return {
          ...badge,
          currentProgress: current,
          requiredProgress: badge.requirement,
          percentage: Math.round(percentage)
        };
      });
    })(),

    // Leaderboard rankings
    (async () => {
      const userSpending = await prisma.order.aggregate({
        where: {
          userId: session.user.id!,
          status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] }
        },
        _sum: { totalCents: true }
      });

      const allSpending = await prisma.order.groupBy({
        by: ['userId'],
        where: { status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] } },
        _sum: { totalCents: true }
      });

      const rankings = await Promise.all(
        allSpending
          .sort((a, b) => (b._sum.totalCents || 0) - (a._sum.totalCents || 0))
          .slice(0, 10)
          .map(async (us, index) => {
            const user = await prisma.user.findUnique({
              where: { id: us.userId },
              select: { id: true, name: true, email: true, image: true }
            });

            return {
              rank: index + 1,
              userId: us.userId,
              user: user!,
              score: us._sum.totalCents || 0,
              displayScore: `KES ${((us._sum.totalCents || 0) / 100).toLocaleString()}`,
              isCurrentUser: us.userId === session.user.id
            };
          })
      );

      return { rankings };
    })(),

    // Active contests
    prisma.contest.findMany({
      where: {
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() }
      },
      take: 3
    })
  ]);

  // Get spin rewards for the wheel
  const spinRewards = await prisma.spinReward.findMany({
    where: { isActive: true },
    orderBy: { probability: 'desc' }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-dark text-white py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-4xl font-bold mb-2">🎮 Gamification Center</h1>
          <p className="text-white/80">Earn badges, spin the wheel, and compete with others!</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-brand-accent/20 shadow-md">
            <div className="text-3xl mb-2">🏅</div>
            <div className="text-2xl font-bold text-brand-dark">{earnedBadges.length}</div>
            <div className="text-sm text-gray-600">Badges Earned</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-brand-accent/20 shadow-md">
            <div className="text-3xl mb-2">🎡</div>
            <div className="text-2xl font-bold text-brand-dark">{userSpins?.spinsAvailable || 0}</div>
            <div className="text-sm text-gray-600">Spins Available</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-brand-accent/20 shadow-md">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold text-brand-dark">
              KES {((userSpins?.totalWinnings || 0) / 100).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Winnings</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-brand-accent/20 shadow-md">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-brand-dark">
              {leaderboardData.rankings.findIndex(r => r.isCurrentUser) + 1 || '-'}
            </div>
            <div className="text-sm text-gray-600">Your Rank</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Spin Wheel & Contests */}
          <div className="lg:col-span-2 space-y-8">
            {/* Spin Wheel Section */}
            <div className="bg-white rounded-xl p-8 border border-brand-accent/20 shadow-lg">
              <h2 className="text-2xl font-bold text-brand-dark mb-6 text-center">
                🎡 Spin & Win!
              </h2>
              <SpinWheelClient 
                rewards={spinRewards}
                spinsAvailable={userSpins?.spinsAvailable || 0}
              />
              <div className="mt-6 text-center text-sm text-gray-600">
                💡 <strong>Earn spins</strong> by completing referrals and hitting milestones!
              </div>
            </div>

            {/* Badges Section */}
            <div className="bg-white rounded-xl p-8 border border-brand-accent/20 shadow-lg">
              <BadgeGrid
                earnedBadges={earnedBadges.map(ub => ({ ...ub.badge, earnedAt: ub.earnedAt }))}
                nextBadges={nextBadges}
                showProgress={true}
              />
            </div>

            {/* Active Contests */}
            {activeContests.length > 0 && (
              <div className="bg-white rounded-xl p-8 border border-brand-accent/20 shadow-lg">
                <h2 className="text-2xl font-bold text-brand-dark mb-6">🎫 Active Contests</h2>
                <div className="space-y-4">
                  {activeContests.map((contest) => (
                    <div key={contest.id} className="border border-brand-accent/20 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-brand-dark mb-1">{contest.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{contest.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-green-600 font-semibold">
                              🏆 {contest.prizeDescription}
                            </span>
                            <span className="text-gray-500">
                              Ends {new Date(contest.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Leaderboard */}
          <div className="lg:col-span-1">
            <Leaderboard
              initialRankings={leaderboardData.rankings}
              initialPeriod="ALL_TIME"
              initialCategory="SPENDING"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Client component wrapper for SpinWheel
function SpinWheelClient({ rewards, spinsAvailable }: any) {
  'use client';
  
  const handleSpin = async () => {
    const response = await fetch('/api/gamification/spin', { method: 'POST' });
    return response.json();
  };

  const handleSpinComplete = (result: any) => {
    // Refresh the page to update stats
    window.location.reload();
  };

  return (
    <SpinWheel
      rewards={rewards}
      onSpin={handleSpin}
      spinsAvailable={spinsAvailable}
      onSpinComplete={handleSpinComplete}
    />
  );
}
