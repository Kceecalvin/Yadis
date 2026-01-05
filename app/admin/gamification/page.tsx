import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';

export default async function GamificationAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/admin/gamification');
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (user?.role !== 'ADMIN') {
    redirect('/');
  }

  // Fetch overview stats
  const [badgeStats, spinStats, contestStats, leaderboardStats] = await Promise.all([
    prisma.badge.groupBy({
      by: ['isActive'],
      _count: { id: true }
    }),
    
    prisma.userSpins.aggregate({
      _sum: { spinsAvailable: true, totalSpins: true, totalWinnings: true }
    }),
    
    prisma.contest.groupBy({
      by: ['isActive'],
      _count: { id: true }
    }),
    
    prisma.userBadge.count()
  ]);

  const activeBadges = badgeStats.find(s => s.isActive)?._count.id || 0;
  const totalBadges = badgeStats.reduce((sum, s) => sum + s._count.id, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🎮 Gamification Admin</h1>
              <p className="text-white/80">Manage badges, contests, spin wheel, and more</p>
            </div>
            <Link
              href="/admin"
              className="px-6 py-3 bg-white text-brand-primary rounded-xl font-semibold hover:shadow-xl transition-all"
            >
              ← Back to Admin
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border border-brand-accent/20">
            <div className="text-3xl mb-2">🏅</div>
            <div className="text-2xl font-bold text-brand-dark">{activeBadges}/{totalBadges}</div>
            <div className="text-sm text-gray-600">Active Badges</div>
            <div className="text-xs text-gray-500 mt-1">{leaderboardStats} earned by users</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-brand-accent/20">
            <div className="text-3xl mb-2">🎡</div>
            <div className="text-2xl font-bold text-brand-dark">{spinStats._sum.spinsAvailable || 0}</div>
            <div className="text-sm text-gray-600">Available Spins</div>
            <div className="text-xs text-gray-500 mt-1">{spinStats._sum.totalSpins || 0} total spins</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-brand-accent/20">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold text-brand-dark">
              KES {((spinStats._sum.totalWinnings || 0) / 100).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Winnings</div>
            <div className="text-xs text-gray-500 mt-1">From spin wheel</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-brand-accent/20">
            <div className="text-3xl mb-2">🎫</div>
            <div className="text-2xl font-bold text-brand-dark">
              {contestStats.find(s => s.isActive)?._count.id || 0}
            </div>
            <div className="text-sm text-gray-600">Active Contests</div>
            <div className="text-xs text-gray-500 mt-1">Live now</div>
          </div>
        </div>

        {/* Management Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Badge Management */}
          <Link href="/admin/gamification/badges" className="group">
            <div className="bg-white rounded-xl p-6 border border-brand-accent/20 shadow-md hover:shadow-xl transition-all hover:scale-105">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-3xl">
                  🏅
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-dark">Badges</h3>
                  <p className="text-sm text-gray-600">{activeBadges} active</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Create, edit, and manage achievement badges
              </p>
              <div className="flex items-center text-brand-primary font-semibold text-sm group-hover:gap-2 transition-all">
                <span>Manage Badges</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Spin Wheel Management */}
          <Link href="/admin/gamification/spin-wheel" className="group">
            <div className="bg-white rounded-xl p-6 border border-brand-accent/20 shadow-md hover:shadow-xl transition-all hover:scale-105">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-3xl">
                  🎡
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-dark">Spin Wheel</h3>
                  <p className="text-sm text-gray-600">8 rewards</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Configure rewards, probabilities, and grant spins
              </p>
              <div className="flex items-center text-brand-primary font-semibold text-sm group-hover:gap-2 transition-all">
                <span>Configure Wheel</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Contest Management */}
          <Link href="/admin/gamification/contests" className="group">
            <div className="bg-white rounded-xl p-6 border border-brand-accent/20 shadow-md hover:shadow-xl transition-all hover:scale-105">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-3xl">
                  🎫
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-dark">Contests</h3>
                  <p className="text-sm text-gray-600">{contestStats.find(s => s.isActive)?._count.id || 0} active</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Create contests, raffles, and select winners
              </p>
              <div className="flex items-center text-brand-primary font-semibold text-sm group-hover:gap-2 transition-all">
                <span>Manage Contests</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Leaderboard Management */}
          <Link href="/admin/gamification/leaderboard" className="group">
            <div className="bg-white rounded-xl p-6 border border-brand-accent/20 shadow-md hover:shadow-xl transition-all hover:scale-105">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-3xl">
                  🏆
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-dark">Leaderboard</h3>
                  <p className="text-sm text-gray-600">Rankings</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                View rankings, reset periods, export data
              </p>
              <div className="flex items-center text-brand-primary font-semibold text-sm group-hover:gap-2 transition-all">
                <span>View Leaderboard</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Analytics */}
          <Link href="/admin/gamification/analytics" className="group">
            <div className="bg-white rounded-xl p-6 border border-brand-accent/20 shadow-md hover:shadow-xl transition-all hover:scale-105">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-3xl">
                  📊
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-dark">Analytics</h3>
                  <p className="text-sm text-gray-600">Insights</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Engagement metrics, badge distribution, ROI
              </p>
              <div className="flex items-center text-brand-primary font-semibold text-sm group-hover:gap-2 transition-all">
                <span>View Analytics</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl p-6 text-white shadow-md">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">Quick Actions</h3>
            <div className="space-y-2 text-sm">
              <button className="w-full text-left py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                Grant Spins to User
              </button>
              <button className="w-full text-left py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                Award Badge Manually
              </button>
              <button className="w-full text-left py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                Create New Contest
              </button>
              <button className="w-full text-left py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                Reset Leaderboard
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-md border border-brand-accent/20">
          <h2 className="text-xl font-bold text-brand-dark mb-4">📈 Recent Activity</h2>
          <p className="text-gray-600 text-sm">Coming soon: Real-time activity feed</p>
        </div>
      </div>
    </div>
  );
}
