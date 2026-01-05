'use client';

import { useState } from 'react';
import Image from 'next/image';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  score: number;
  displayScore: string;
  isCurrentUser: boolean;
}

interface LeaderboardProps {
  initialRankings: LeaderboardEntry[];
  initialPeriod?: string;
  initialCategory?: string;
  userRank?: LeaderboardEntry | null;
}

export default function Leaderboard({ 
  initialRankings, 
  initialPeriod = 'ALL_TIME', 
  initialCategory = 'SPENDING',
  userRank: initialUserRank
}: LeaderboardProps) {
  const [period, setPeriod] = useState(initialPeriod);
  const [category, setCategory] = useState(initialCategory);
  const [rankings, setRankings] = useState(initialRankings);
  const [userRank, setUserRank] = useState(initialUserRank);
  const [loading, setLoading] = useState(false);

  const periods = [
    { value: 'ALL_TIME', label: 'All Time', icon: '🏆' },
    { value: 'MONTHLY', label: 'This Month', icon: '📅' },
    { value: 'WEEKLY', label: 'This Week', icon: '⚡' },
  ];

  const categories = [
    { value: 'SPENDING', label: 'Top Spenders', icon: '💰' },
    { value: 'REFERRALS', label: 'Top Referrers', icon: '🤝' },
    { value: 'ORDERS', label: 'Most Orders', icon: '🛍️' },
    { value: 'POINTS', label: 'Most Points', icon: '⭐' },
  ];

  const fetchLeaderboard = async (newPeriod: string, newCategory: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/gamification/leaderboard?period=${newPeriod}&category=${newCategory}&limit=10`
      );
      const data = await response.json();
      
      if (data.success) {
        setRankings(data.rankings);
        setUserRank(data.userRank);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    fetchLeaderboard(newPeriod, category);
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    fetchLeaderboard(period, newCategory);
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return { emoji: '🥇', color: 'from-yellow-400 to-yellow-600', glow: 'shadow-yellow-500/50' };
      case 2: return { emoji: '🥈', color: 'from-gray-300 to-gray-500', glow: 'shadow-gray-400/50' };
      case 3: return { emoji: '🥉', color: 'from-orange-400 to-orange-600', glow: 'shadow-orange-500/50' };
      default: return { emoji: `#${rank}`, color: 'from-brand-primary to-brand-secondary', glow: 'shadow-brand-primary/30' };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-brand-accent/20 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary p-6">
        <h2 className="text-2xl font-bold text-white mb-1">🏆 Leaderboard</h2>
        <p className="text-white/80 text-sm">See how you rank against top performers</p>
      </div>

      {/* Period Tabs */}
      <div className="flex border-b border-brand-accent/20 bg-gray-50">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePeriodChange(p.value)}
            disabled={loading}
            className={`flex-1 px-4 py-3 font-semibold text-sm transition-all ${
              period === p.value
                ? 'bg-white text-brand-primary border-b-2 border-brand-primary'
                : 'text-gray-600 hover:text-brand-primary hover:bg-white/50'
            }`}
          >
            <span className="mr-2">{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      {/* Category Pills */}
      <div className="p-4 flex gap-2 flex-wrap bg-gray-50 border-b border-brand-accent/20">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => handleCategoryChange(cat.value)}
            disabled={loading}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
              category === cat.value
                ? 'bg-brand-primary text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-300 hover:border-brand-primary hover:text-brand-primary'
            }`}
          >
            <span className="mr-1">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* User's Rank (if not in top 10) */}
      {userRank && !rankings.find(r => r.isCurrentUser) && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold">
              #{userRank.rank}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-brand-dark">Your Rank</span>
                <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full font-semibold">
                  YOU
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">{userRank.displayScore}</div>
            </div>
          </div>
        </div>
      )}

      {/* Rankings */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
          </div>
        ) : rankings.length > 0 ? (
          <div className="space-y-3">
            {rankings.map((entry) => {
              const rankBadge = getRankBadge(entry.rank);
              
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    entry.isCurrentUser
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-brand-primary shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {/* Rank Badge */}
                  <div className={`flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br ${rankBadge.color} shadow-lg ${rankBadge.glow} font-bold text-white text-lg`}>
                    {rankBadge.emoji}
                  </div>

                  {/* User Avatar */}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {entry.user.image ? (
                      <Image
                        src={entry.user.image}
                        alt={entry.user.name || 'User'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-secondary text-white font-bold text-lg">
                        {(entry.user.name || entry.user.email).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-brand-dark truncate">
                        {entry.user.name || entry.user.email}
                      </h4>
                      {entry.isCurrentUser && (
                        <span className="px-2 py-1 bg-brand-primary text-white text-xs rounded-full font-semibold">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{entry.displayScore}</p>
                  </div>

                  {/* Trophy for top 3 */}
                  {entry.rank <= 3 && (
                    <div className="text-3xl animate-bounce">
                      {entry.rank === 1 ? '👑' : entry.rank === 2 ? '✨' : '🎉'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-brand-dark mb-2">No Rankings Yet</h3>
            <p className="text-gray-600">Be the first to appear on the leaderboard!</p>
          </div>
        )}
      </div>
    </div>
  );
}
