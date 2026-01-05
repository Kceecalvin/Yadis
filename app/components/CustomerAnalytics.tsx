'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Analytics {
  totalPurchases: number;
  totalSpent: number;
  averageOrderValue: number;
  lastPurchaseDate?: string;
  daysSinceLastPurchase?: number;
  favoriteCategory?: string;
  churnRisk: boolean;
  isActive: boolean;
}

export default function CustomerAnalytics() {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchAnalytics();
    }
  }, [session]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/user');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading analytics...</div>;
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-brand-dark">Your Shopping Analytics</h2>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Purchases */}
        <div className="bg-white border border-brand-accent/20 rounded-lg p-4">
          <p className="text-sm text-brand-secondary mb-1">Total Purchases</p>
          <p className="text-3xl font-bold text-brand-primary">{analytics.totalPurchases}</p>
          <p className="text-xs text-brand-secondary mt-2">orders completed</p>
        </div>

        {/* Total Spent */}
        <div className="bg-white border border-brand-accent/20 rounded-lg p-4">
          <p className="text-sm text-brand-secondary mb-1">Total Spent</p>
          <p className="text-3xl font-bold text-brand-primary">
            KES {(analytics.totalSpent / 100).toLocaleString()}
          </p>
          <p className="text-xs text-brand-secondary mt-2">all time</p>
        </div>

        {/* Average Order */}
        <div className="bg-white border border-brand-accent/20 rounded-lg p-4">
          <p className="text-sm text-brand-secondary mb-1">Average Order</p>
          <p className="text-3xl font-bold text-brand-primary">
            KES {(analytics.averageOrderValue / 100).toLocaleString()}
          </p>
          <p className="text-xs text-brand-secondary mt-2">per purchase</p>
        </div>

        {/* Last Purchase */}
        <div className="bg-white border border-brand-accent/20 rounded-lg p-4">
          <p className="text-sm text-brand-secondary mb-1">Last Purchase</p>
          <p className="text-3xl font-bold text-brand-primary">
            {analytics.daysSinceLastPurchase || 'N/A'}
          </p>
          <p className="text-xs text-brand-secondary mt-2">days ago</p>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white border border-brand-accent/20 rounded-lg p-6">
        <h3 className="font-bold text-brand-dark mb-4">Your Insights</h3>

        <div className="space-y-3">
          {analytics.favoriteCategory && (
            <div className="flex items-center gap-3 p-3 bg-brand-light rounded">
              <span className="text-2xl">🏷️</span>
              <div>
                <p className="font-semibold text-brand-dark">Favorite Category</p>
                <p className="text-sm text-brand-secondary">{analytics.favoriteCategory}</p>
              </div>
            </div>
          )}

          {analytics.churnRisk && (
            <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-orange-800">We Miss You!</p>
                <p className="text-sm text-orange-700">
                  Haven't seen you in a while. Check out our new products!
                </p>
              </div>
            </div>
          )}

          {!analytics.churnRisk && analytics.totalPurchases > 5 && (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded">
              <span className="text-2xl">⭐</span>
              <div>
                <p className="font-semibold text-green-800">Loyal Customer</p>
                <p className="text-sm text-green-700">
                  You're one of our valued regular customers!
                </p>
              </div>
            </div>
          )}

          {analytics.isActive && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-semibold text-blue-800">Active Member</p>
                <p className="text-sm text-blue-700">
                  Keep shopping to unlock rewards and benefits!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
