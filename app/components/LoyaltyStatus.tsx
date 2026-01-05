'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface LoyaltyInfo {
  currentTier: {
    name: string;
    minSpend: number;
    discountPercentage: number;
    pointsMultiplier: number;
  };
  nextTier?: {
    name: string;
    minSpend: number;
    spendRemaining: number;
  };
  totalSpent: number;
  benefits: string[];
}

export default function LoyaltyStatus() {
  const { data: session } = useSession();
  const [loyalty, setLoyalty] = useState<LoyaltyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchLoyaltyStatus();
    }
  }, [session]);

  const fetchLoyaltyStatus = async () => {
    try {
      const response = await fetch('/api/loyalty/status');
      if (response.ok) {
        const data = await response.json();
        setLoyalty(data.loyalty);
      }
    } catch (err) {
      console.error('Error fetching loyalty status:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading loyalty status...</div>;
  }

  if (!loyalty) {
    return null;
  }

  const tierColors: Record<string, { bg: string; text: string; badge: string }> = {
    BRONZE: { bg: 'bg-amber-50', text: 'text-amber-900', badge: '🥉' },
    SILVER: { bg: 'bg-slate-50', text: 'text-slate-900', badge: '🥈' },
    GOLD: { bg: 'bg-yellow-50', text: 'text-yellow-900', badge: '🥇' },
    PLATINUM: { bg: 'bg-purple-50', text: 'text-purple-900', badge: '👑' },
  };

  const colors = tierColors[loyalty.currentTier.name] || tierColors.BRONZE;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-brand-dark">Your Loyalty Status</h2>

      {/* Current Tier */}
      <div className={`${colors.bg} border-2 border-brand-accent/20 rounded-lg p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-brand-secondary mb-1">Current Tier</p>
            <h3 className={`text-3xl font-bold ${colors.text}`}>
              {colors.badge} {loyalty.currentTier.name}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-brand-secondary mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-brand-primary">
              KES {(loyalty.totalSpent / 100).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          <p className="font-semibold text-brand-dark">Your Benefits:</p>
          {loyalty.benefits.map((benefit, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span>✓</span>
              <span className="text-brand-secondary">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress to Next Tier */}
      {loyalty.nextTier && (
        <div className="bg-white border border-brand-accent/20 rounded-lg p-6">
          <p className="font-semibold text-brand-dark mb-3">Progress to Next Tier</p>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-brand-secondary">
                {loyalty.currentTier.name} → {loyalty.nextTier.name}
              </span>
              <span className="text-sm font-semibold text-brand-primary">
                {Math.round(((loyalty.totalSpent) / (loyalty.nextTier.minSpend)) * 100)}%
              </span>
            </div>
            <div className="w-full h-3 bg-brand-light rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-primary transition-all"
                style={{
                  width: `${Math.min(
                    ((loyalty.totalSpent) / (loyalty.nextTier.minSpend)) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          <p className="text-sm text-brand-secondary">
            Spend <span className="font-bold text-brand-primary">
              KES {(loyalty.nextTier.spendRemaining / 100).toLocaleString()}
            </span>{' '}
            more to reach {loyalty.nextTier.name} tier!
          </p>
        </div>
      )}

      {/* Tier Information */}
      <div className="bg-white border border-brand-accent/20 rounded-lg p-6">
        <h3 className="font-bold text-brand-dark mb-4">Loyalty Tiers</h3>

        <div className="space-y-3">
          {['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'].map((tier) => (
            <div
              key={tier}
              className={`p-3 rounded border-l-4 ${
                tier === loyalty.currentTier.name
                  ? 'bg-brand-light border-l-brand-primary'
                  : 'bg-gray-50 border-l-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-brand-dark">{tier}</span>
                <span className="text-sm text-brand-secondary">
                  {tier === 'BRONZE' && 'KES 0+'}
                  {tier === 'SILVER' && 'KES 100,000+'}
                  {tier === 'GOLD' && 'KES 500,000+'}
                  {tier === 'PLATINUM' && 'KES 1,000,000+'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
