'use client';

import { useEffect, useState } from 'react';

interface Milestone {
  id: string;
  name: string;
  description: string;
  icon: string;
  threshold: number;
  rewardValue: number;
  rewardType: string;
  achieved: boolean;
}

interface MilestoneProgressProps {
  type?: string;
  currentValue: number;
}

export default function MilestoneProgress({ 
  type = 'REFERRALS', 
  currentValue 
}: MilestoneProgressProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMilestones();
  }, []);

  const fetchMilestones = async () => {
    try {
      const response = await fetch('/api/gamification/milestones');
      const data = await response.json();
      if (data.success) {
        const filtered = data.milestones.filter((m: any) => m.type === type);
        setMilestones(filtered);
      }
    } catch (error) {
      console.error('Error fetching milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextMilestone = () => {
    return milestones.find((m) => !m.achieved && m.threshold > currentValue);
  };

  const getCurrentTier = () => {
    const achieved = milestones.filter((m) => m.achieved);
    return achieved[achieved.length - 1];
  };

  const nextMilestone = getNextMilestone();
  const currentTier = getCurrentTier();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-brand-accent/20 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (!nextMilestone) {
    return (
      <div className="bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl shadow-md border border-brand-primary/20 p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-8 h-8 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <h3 className="text-2xl font-bold">Max Level Achieved!</h3>
        </div>
        <p className="text-white/90">
          You've completed all referral milestones. You're a true champion!
        </p>
        <p className="mt-2 text-3xl font-bold">{currentValue} referrals</p>
      </div>
    );
  }

  const progress = (currentValue / nextMilestone.threshold) * 100;
  const remaining = nextMilestone.threshold - currentValue;

  return (
    <div className="bg-white rounded-xl shadow-md border border-brand-accent/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <h3 className="text-xl font-bold text-brand-dark">Progress to Next Milestone</h3>
        </div>
        {currentTier && (
          <span className="px-3 py-1 bg-brand-primary text-white rounded-full text-sm font-semibold animate-pulse">
            {currentTier.name}
          </span>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-brand-secondary">
            {nextMilestone.name}
          </span>
          <span className="text-sm font-medium text-brand-dark">
            {currentValue} / {nextMilestone.threshold} referrals
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-brand-primary to-brand-secondary h-4 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
            style={{ width: `${Math.min(progress, 100)}%` }}
          >
            {progress > 10 && (
              <span className="text-xs font-bold text-white animate-fade-in">{Math.round(progress)}%</span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 bg-brand-light border border-brand-accent/10 rounded-lg">
        <p className="font-semibold text-brand-dark mb-1">{nextMilestone.name}</p>
        <p className="text-sm text-brand-secondary mb-3">{nextMilestone.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-brand-secondary">
            {remaining} more referral{remaining !== 1 ? 's' : ''} needed
          </span>
          <span className="px-3 py-1 bg-brand-primary text-white rounded-full text-sm font-semibold">
            {nextMilestone.rewardType === 'POINTS'
              ? `${nextMilestone.rewardValue} points`
              : `${nextMilestone.rewardValue} spin${nextMilestone.rewardValue !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {/* All Milestones */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-brand-dark mb-3">All Milestones</h4>
        <div className="space-y-2">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                milestone.achieved
                  ? 'bg-green-50 border border-green-200'
                  : milestone.threshold === nextMilestone.threshold
                  ? 'bg-brand-primary/5 border border-brand-primary/20 animate-pulse'
                  : 'bg-gray-50 border border-brand-accent/10'
              }`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-brand-dark">{milestone.name}</p>
              </div>
              {milestone.achieved ? (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-xs text-brand-secondary font-medium">{milestone.threshold}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
