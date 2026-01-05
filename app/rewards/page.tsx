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

interface SpendingReward {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  value: number;
  minSpend: number;
  quantity: number;
  isActive: boolean;
}

interface UserSpendingRewards {
  totalSpend: number;
  purchaseCount: number;
  currentBracketSpend: number;
  bracketRewardAwarded: number;
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

export default function RewardsPage() {
  const { data: session, status } = useSession();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [points, setPoints] = useState({ available: 0, total: 0, used: 0 });
  const [spendingRewards, setSpendingRewards] = useState<SpendingReward[]>([]);
  const [userSpending, setUserSpending] = useState<UserSpendingRewards | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'points' | 'spending'>('points');
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin?callbackUrl=/rewards');
    }

    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rewardsRes, pointsRes, redemptionsRes, spendingRes, userSpendingRes] = await Promise.all([
        fetch('/api/gamification/rewards-store'),
        fetch('/api/gamification/points'),
        fetch('/api/gamification/rewards-store/my-redemptions'),
        fetch('/api/rewards/catalog'),
        fetch('/api/rewards/user'),
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

      // Fetch spending-based rewards
      if (spendingRes.ok) {
        const spendingData = await spendingRes.json();
        setSpendingRewards(spendingData);
      }
      if (userSpendingRes.ok) {
        const userData = await userSpendingRes.json();
        setUserSpending(userData);
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
        alert(`Reward redeemed successfully! ${data.redemption.code ? `Your code: ${data.redemption.code}` : ''}`);
        fetchData();
      } else {
        alert(`Error: ${data.error || 'Failed to redeem reward'}`);
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert('Failed to redeem reward');
    } finally {
      setRedeeming(null);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'DISCOUNT':
        return 'Discount Coupon';
      case 'FREE_DELIVERY':
        return 'Free Delivery';
      case 'GIFT_CARD':
        return 'Gift Card';
      case 'BADGE':
        return 'Exclusive Badge';
      default:
        return 'Reward';
    }
  };

  const filteredRewards = selectedCategory === 'ALL' 
    ? rewards 
    : rewards.filter(r => r.category === selectedCategory);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary mx-auto mb-4"></div>
          <p className="text-brand-secondary">Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="relative bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-dark text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Rewards Store</h1>
            <p className="text-white/90 text-lg">Redeem your points for amazing rewards</p>
          </div>

          {/* Points Balance Card */}
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80 mb-1">Your Points Balance</p>
                <h2 className="text-5xl font-bold">{points.available.toLocaleString()}</h2>
                <p className="text-sm text-white/70 mt-2">
                  Lifetime: {points.total.toLocaleString()} | Used: {points.used.toLocaleString()}
                </p>
              </div>
              <Link
                href="/referral-new"
                className="px-6 py-3 bg-white text-brand-primary rounded-lg font-semibold hover:bg-brand-light transition-all"
              >
                Earn More Points
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-brand-accent/20">
          <button
            onClick={() => setActiveTab('points')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'points'
                ? 'text-brand-primary border-b-2 border-brand-primary'
                : 'text-brand-secondary hover:text-brand-dark'
            }`}
          >
            Points Rewards
          </button>
          <button
            onClick={() => setActiveTab('spending')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'spending'
                ? 'text-brand-primary border-b-2 border-brand-primary'
                : 'text-brand-secondary hover:text-brand-dark'
            }`}
          >
            Spending Rewards
          </button>
        </div>

        {activeTab === 'points' && (
          <>
            {/* Category Filter */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {['ALL', 'DISCOUNTS', 'DELIVERIES', 'SPECIAL'].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-brand-primary text-white'
                      : 'bg-white text-brand-dark border border-brand-accent/20 hover:border-brand-primary'
                  }`}
                >
                  {category.charAt(0) + category.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Rewards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredRewards.map((reward) => {
            const canAfford = points.available >= reward.pointsCost;
            const isOutOfStock = reward.stock !== null && reward.stock <= 0;

                return (
                  <div
                    key={reward.id}
                    className={`bg-white rounded-xl shadow-md border overflow-hidden hover:shadow-xl transition-all ${
                      reward.isFeatured ? 'border-brand-primary border-2' : 'border-brand-accent/20'
                    }`}
                  >
                {reward.isFeatured && (
                  <div className="bg-brand-primary text-white text-center py-1 text-sm font-semibold">
                    FEATURED REWARD
                  </div>
                )}
                
                <div className="p-6">
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-semibold rounded-full">
                      {getTypeLabel(reward.type)}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-brand-dark mb-2">
                    {reward.name}
                  </h3>
                  <p className="text-sm text-brand-secondary mb-4">
                    {reward.description}
                  </p>

                  <div className="flex items-baseline justify-center mb-4 py-3 bg-brand-light rounded-lg">
                    <span className="text-3xl font-bold text-brand-primary">
                      {reward.pointsCost.toLocaleString()}
                    </span>
                    <span className="text-sm text-brand-secondary ml-2">points</span>
                  </div>

                  {reward.stock !== null && (
                    <p className="text-sm text-center text-brand-secondary mb-3">
                      Stock: {reward.stock} remaining
                    </p>
                  )}

                  <button
                    onClick={() => handleRedeem(reward.id)}
                    disabled={!canAfford || isOutOfStock || redeeming === reward.id}
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                      canAfford && !isOutOfStock
                        ? 'bg-brand-primary text-white hover:bg-brand-secondary'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {redeeming === reward.id
                      ? 'Redeeming...'
                      : isOutOfStock
                      ? 'Out of Stock'
                      : !canAfford
                      ? `Need ${(reward.pointsCost - points.available).toLocaleString()} more points`
                      : 'Redeem Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

            {/* My Redemptions */}
            {redemptions.length > 0 && (
              <div className="bg-white rounded-xl shadow-md border border-brand-accent/20 p-6">
                <h2 className="text-2xl font-bold text-brand-dark mb-6">My Redemptions</h2>
                <div className="space-y-3">
                  {redemptions.slice(0, 10).map((redemption) => (
                    <div
                      key={redemption.id}
                      className="flex items-center justify-between p-4 bg-brand-light rounded-lg border border-brand-accent/10"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-brand-dark">{redemption.reward.name}</p>
                        <p className="text-sm text-brand-secondary">
                          {new Date(redemption.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-brand-primary">
                          -{redemption.pointsSpent} points
                        </p>
                        {redemption.code && (
                          <p className="text-sm text-brand-secondary font-mono mt-1">{redemption.code}</p>
                        )}
                        <span
                          className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${
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
          </>
        )}

        {activeTab === 'spending' && userSpending && (
              <>
                {/* Spending Progress */}
                <div className="bg-white rounded-xl shadow-md border border-brand-accent/20 p-6 mb-8">
                  <h3 className="text-xl font-bold text-brand-dark mb-4">Your Spending Progress</h3>
                  <div className="grid md:grid-cols-3 gap-6 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-brand-secondary mb-1">Total Spent</p>
                      <p className="text-2xl font-bold text-brand-primary">
                        KES {(userSpending.totalSpend / 100).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-brand-secondary mb-1">Orders Made</p>
                      <p className="text-2xl font-bold text-brand-dark">{userSpending.purchaseCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-brand-secondary mb-1">Current Bracket Spend</p>
                      <p className="text-2xl font-bold text-green-600">
                        KES {(userSpending.currentBracketSpend / 100).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-brand-secondary text-center">
                    Keep shopping to unlock rewards based on your spending!
                  </p>
                </div>

                {/* Spending Rewards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {spendingRewards.filter(r => r.isActive).map((reward) => {
                    const canUnlock = userSpending.totalSpend >= reward.minSpend;

                    return (
                      <div
                        key={reward.id}
                        className={`bg-white rounded-xl shadow-md border overflow-hidden ${
                          canUnlock ? 'border-green-500' : 'border-brand-accent/20'
                        }`}
                      >
                        <div className="p-6">
                          {canUnlock && (
                            <div className="mb-3">
                              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                UNLOCKED
                              </span>
                            </div>
                          )}
                          
                          <h3 className="text-xl font-bold text-brand-dark mb-2">{reward.title}</h3>
                          <p className="text-sm text-brand-secondary mb-4">{reward.description}</p>

                          <div className="flex items-baseline justify-center mb-4 py-3 bg-brand-light rounded-lg">
                            <span className="text-sm text-brand-secondary mr-2">Minimum Spend:</span>
                            <span className="text-xl font-bold text-brand-primary">
                              KES {(reward.minSpend / 100).toLocaleString()}
                            </span>
                          </div>

                          {!canUnlock && (
                            <p className="text-sm text-center text-brand-secondary">
                              Spend KES {((reward.minSpend - userSpending.totalSpend) / 100).toLocaleString()} more to unlock
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
      </div>
    </div>
  );
}
