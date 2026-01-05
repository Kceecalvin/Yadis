'use client';

import { useEffect, useState } from 'react';

interface Contest {
  id: string;
  name: string;
  description: string;
  prizeDescription: string;
  endDate: string;
  userEntries?: number;
  userRank?: number;
}

export default function ActiveContest() {
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveContest();
  }, []);

  const fetchActiveContest = async () => {
    try {
      const response = await fetch('/api/gamification/contests?type=REFERRAL');
      const data = await response.json();
      if (data.success && data.contests && data.contests.length > 0) {
        setContest(data.contests[0]);
      }
    } catch (error) {
      console.error('Error fetching contest:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl shadow-md border border-brand-primary/20 p-6 animate-pulse">
        <div className="h-6 bg-white/20 rounded w-2/3 mb-3"></div>
        <div className="h-4 bg-white/20 rounded w-full mb-2"></div>
        <div className="h-4 bg-white/20 rounded w-3/4"></div>
      </div>
    );
  }

  if (!contest) {
    return null;
  }

  const daysRemaining = getDaysRemaining(contest.endDate);

  return (
    <div className="bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-dark rounded-xl shadow-md border border-brand-primary/20 p-6 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 opacity-5">
        <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-8 h-8 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <h3 className="text-2xl font-bold">ACTIVE CONTEST</h3>
        </div>

        <h4 className="text-xl font-bold mb-2">{contest.name}</h4>
        <p className="text-white/90 mb-4">{contest.description}</p>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-sm text-white/80 mb-1">Prize</p>
            <p className="font-bold text-lg">{contest.prizeDescription}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-sm text-white/80 mb-1">Time Remaining</p>
            <p className="font-bold text-lg">
              {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
            </p>
          </div>
          {contest.userEntries !== undefined && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-sm text-white/80 mb-1">Your Entries</p>
              <p className="font-bold text-lg">{contest.userEntries}</p>
            </div>
          )}
        </div>

        {contest.userRank && (
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mb-4 border border-white/30">
            <p className="text-sm text-white/80 mb-1">Your Current Rank</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">#{contest.userRank}</p>
              {contest.userRank <= 3 && (
                <span className="px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold animate-bounce">
                  In Prize Zone!
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          <svg className="w-5 h-5 text-white flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-white/90">
            Every successful referral earns you an entry. Refer more friends to increase your chances!
          </p>
        </div>
      </div>
    </div>
  );
}
