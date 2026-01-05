'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';

interface Reward {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  pointsCost: number;
  type: string;
  value: number;
  stock?: number;
  category: string;
  isFeatured: boolean;
}

interface Redemption {
  id: string;
  reward: {
    name: string;
    description: string;
    type: string;
    value: number;
  };
  pointsSpent: number;
  status: string;
  code?: string;
  expiresAt?: string;
  createdAt: string;
}

export default function RewardsStorePage() {
  const { data: session, status } = useSession();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [points, setPoints] = useState({ available: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin?callbackUrl=/rewards-store');
    }

    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rewardsRes, pointsRes, redemptionsRes] = await Promise.all([
        fetch('/api/gamification/rewards-store'),
        fetch('/api/gamification/points'),
        fetch('/api/gamification/rewards-store/my-redemptions'),
      ]);

      const rewardsData = await rewardsRes.json();
      const pointsData = await pointsRes.json();
      const redemptionsData = await redemptionsRes.json();

      if (rewardsData.success) {
        setRewards(rewardsData.rewards);
      }
      if (pointsData.success) {
        setPoints(pointsData.points);
      }
      if (redemptionsData.success) {
        setRedemptions(redemptionsData.redemptions);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (rewardId: string) => {
    try {
      setRedeeming(rewardId);
      const response = await fetch('/api/gamification/rewards-store/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Reward redeemed successfully! ${data.redemption.code ? `Your code: ${data.redemption.code}` : ''}`);
        fetchData(); // Refresh data
      } else {
        alert(`❌ ${data.error || 'Failed to redeem reward'}`);
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert('❌ Failed to redeem reward');
    } finally {
      setRedeeming(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DISCOUNT':
        return '🎫';
      case 'FREE_DELIVERY':
        return '🚚';
      case 'GIFT_CARD':
        return '💳';
      case 'BADGE':
        return '⭐';
      default:
        return '🎁';
    }
  };

  const filteredRewards = selectedCategory === 'ALL' 
    ? rewards 
    : rewards.filter(r => r.category === selectedCategory);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rewards store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🎁 Rewards Store</h1>
          <p className="text-gray-600 text-lg">Redeem your points for amazing rewards!</p>
        </div>

        {/* Points Balance */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80 mb-1">Your Points Balance</p>
              <h2 className="text-5xl font-bold">{points.available.toLocaleString()}</h2>
              <p className="text-sm text-white/70 mt-2">Lifetime: {points.total.toLocaleString()}</p>
            </div>
            <Link
              href="/referral-new"
              className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-all"
            >
              Earn More Points
            </Link>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['ALL', 'DISCOUNTS', 'DELIVERIES', 'SPECIAL'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-purple-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Rewards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredRewards.map((reward) => {
            const canAfford = points.available >= reward.pointsCost;
            const isOutOfStock = reward.stock !== null && reward.stock <= 0;

            return (
              <div
                key={reward.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                  reward.isFeatured ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                {reward.isFeatured && (
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-1 text-sm font-semibold">
                    ⭐ FEATURED
                  </div>
                )}
                
                <div className="p-6">
                  <div className="text-5xl text-center mb-3">{getTypeIcon(reward.type)}</div>
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                    {reward.name}
                  </h3>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    {reward.description}
                  </p>

                  <div className="flex items-center justify-center mb-4">
                    <div className="px-4 py-2 bg-purple-100 rounded-full">
                      <span className="text-2xl font-bold text-purple-700">
                        {reward.pointsCost.toLocaleString()}
                      </span>
                      <span className="text-sm text-purple-600 ml-1">pts</span>
                    </div>
                  </div>

                  {reward.stock !== null && (
                    <p className="text-sm text-center text-gray-600 mb-3">
                      Stock: {reward.stock} left
                    </p>
                  )}

                  <button
                    onClick={() => handleRedeem(reward.id)}
                    disabled={!canAfford || isOutOfStock || redeeming === reward.id}
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                      canAfford && !isOutOfStock
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {redeeming === reward.id
                      ? 'Redeeming...'
                      : isOutOfStock
                      ? 'Out of Stock'
                      : !canAfford
                      ? `Need ${(reward.pointsCost - points.available).toLocaleString()} more points`
                      : 'Redeem'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* My Redemptions */}
        {redemptions.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Redemptions</h2>
            <div className="space-y-3">
              {redemptions.slice(0, 10).map((redemption) => (
                <div
                  key={redemption.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{redemption.reward.name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(redemption.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">
                      -{redemption.pointsSpent} pts
                    </p>
                    {redemption.code && (
                      <p className="text-sm text-gray-600 font-mono">{redemption.code}</p>
                    )}
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        redemption.status === 'FULFILLED'
                          ? 'bg-green-100 text-green-700'
                          : redemption.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {redemption.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
