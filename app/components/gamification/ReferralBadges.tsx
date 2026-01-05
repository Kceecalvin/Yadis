'use client';

import { useEffect, useState } from 'react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  earned: boolean;
  earnedAt?: string;
  progress?: number;
  requirement?: number;
}

export default function ReferralBadges() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await fetch('/api/gamification/badges?category=REFERRAL');
      const data = await response.json();
      if (data.success) {
        setBadges(data.badges || []);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BRONZE':
        return 'from-orange-700 to-orange-500';
      case 'SILVER':
        return 'from-gray-400 to-gray-300';
      case 'GOLD':
        return 'from-yellow-500 to-yellow-400';
      case 'PLATINUM':
        return 'from-purple-600 to-pink-600';
      default:
        return 'from-gray-500 to-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-brand-accent/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-6 bg-gray-300 rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 bg-gray-100 rounded-lg animate-pulse">
              <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const earnedBadges = badges.filter((b) => b.earned);
  const upcomingBadges = badges.filter((b) => !b.earned);

  return (
    <div className="bg-white rounded-xl shadow-md border border-brand-accent/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <h3 className="text-xl font-bold text-brand-dark">Your Badges</h3>
        </div>
        <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-sm font-semibold">
          {earnedBadges.length} / {badges.length}
        </span>
      </div>

      {earnedBadges.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-brand-dark mb-3">Earned Badges</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 bg-gradient-to-br ${getTierColor(
                  badge.tier
                )} rounded-lg text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all cursor-pointer group`}
              >
                <div className="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-center">{badge.name}</p>
                <p className="text-xs text-center text-white/80 mt-1">{badge.tier}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcomingBadges.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-brand-dark mb-3">Upcoming Badges</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {upcomingBadges.map((badge) => (
              <div
                key={badge.id}
                className="p-4 bg-brand-light rounded-lg border-2 border-dashed border-brand-accent/30 hover:border-brand-primary/50 transition-all group"
              >
                <div className="w-12 h-12 mx-auto mb-2 bg-brand-accent/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-brand-secondary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-center text-brand-dark">{badge.name}</p>
                <p className="text-xs text-center text-brand-secondary mt-1">
                  {badge.requirement} referrals needed
                </p>
                {badge.progress !== undefined && badge.requirement && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-brand-primary to-brand-secondary h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((badge.progress / badge.requirement) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
