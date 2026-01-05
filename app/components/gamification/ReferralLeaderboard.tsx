'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userImage?: string;
  score: number;
  isCurrentUser?: boolean;
}

export default function ReferralLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'WEEKLY' | 'MONTHLY' | 'ALL_TIME'>('MONTHLY');

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/gamification/leaderboard?period=${period}&category=REFERRALS&limit=10`
      );
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
          1
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
          2
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
          3
        </div>
      );
    } else {
      return (
        <div className="w-10 h-10 bg-brand-light rounded-full flex items-center justify-center text-brand-dark font-bold">
          {rank}
        </div>
      );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-brand-accent/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <h3 className="text-xl font-bold text-brand-dark">Referral Leaderboard</h3>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="px-4 py-2 border border-brand-accent/20 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white"
        >
          <option value="WEEKLY">This Week</option>
          <option value="MONTHLY">This Month</option>
          <option value="ALL_TIME">All Time</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg animate-pulse">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <p className="text-center text-brand-secondary py-8">No leaderboard data yet</p>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all hover:shadow-md ${
                entry.isCurrentUser
                  ? 'bg-brand-primary/10 border-2 border-brand-primary'
                  : entry.rank <= 3
                  ? 'bg-yellow-50/50 border border-yellow-200'
                  : 'bg-brand-light border border-brand-accent/10'
              }`}
            >
              <div className="flex-shrink-0">
                {getMedalIcon(entry.rank)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-brand-dark">
                  {entry.userName || 'Anonymous'}
                  {entry.isCurrentUser && (
                    <span className="ml-2 text-sm text-brand-primary">(You)</span>
                  )}
                </p>
                <p className="text-sm text-brand-secondary">{entry.score} referrals</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-lg">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-brand-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-sm text-brand-dark font-medium">
            Top 3 referrers win bonus rewards at the end of each month!
          </p>
        </div>
      </div>
    </div>
  );
}
