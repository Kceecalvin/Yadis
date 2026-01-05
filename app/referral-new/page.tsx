'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import PointsBalance from '@/app/components/gamification/PointsBalance';
import ReferralLeaderboard from '@/app/components/gamification/ReferralLeaderboard';
import MilestoneProgress from '@/app/components/gamification/MilestoneProgress';
import ReferralBadges from '@/app/components/gamification/ReferralBadges';
import ActiveContest from '@/app/components/gamification/ActiveContest';
import SpinWheel from '@/app/components/gamification/SpinWheel';

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  referralLink: string;
}

export default function ReferralGamificationPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [spinsAvailable, setSpinsAvailable] = useState(0);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchReferralData();
      fetchSpins();
    }
  }, [status]);

  // Redirect if unauthenticated after loading
  if (status === 'unauthenticated') {
    redirect('/auth/signin?callbackUrl=/referral-new');
  }

  const fetchReferralData = async () => {
    try {
      const response = await fetch('/api/referral/stats');
      const data = await response.json();
      
      console.log('Referral API Response:', data); // Debug log
      
      if (data.success) {
        setStats({
          referralCode: data.referralCode || 'LOADING',
          totalReferrals: data.stats?.totalReferrals || 0,
          completedReferrals: data.stats?.completedReferrals || 0,
          pendingReferrals: data.stats?.pendingReferrals || 0,
          referralLink: `${window.location.origin}/signup?ref=${data.referralCode}`,
        });
      } else {
        console.error('API returned error:', data.error);
        setStats(null);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpins = async () => {
    try {
      const response = await fetch('/api/gamification/spins');
      const data = await response.json();
      if (data.success) {
        setSpinsAvailable(data.spinsAvailable || 0);
      }
    } catch (error) {
      console.error('Error fetching spins:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary mx-auto mb-4"></div>
          <p className="text-brand-secondary">Loading your referral dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load referral data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="relative bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-dark text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Referral Rewards Dashboard
            </h1>
            <p className="text-white/90 text-lg">
              Invite friends, earn rewards, and climb the leaderboard
            </p>
          </div>

          {/* Points Balance Integrated */}
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <PointsBalance />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md border border-brand-accent/20 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-brand-dark">Your Code</h3>
            </div>
            <p className="text-3xl font-bold text-brand-primary mb-2">{stats.referralCode}</p>
            <button
              onClick={() => copyToClipboard(stats.referralCode)}
              className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-all"
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-brand-accent/20 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-brand-dark">Successful</h3>
            </div>
            <p className="text-3xl font-bold text-green-600 mb-2">{stats.completedReferrals}</p>
            <p className="text-sm text-brand-secondary">
              {stats.pendingReferrals} pending
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-brand-accent/20 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-brand-dark">Spins Available</h3>
            </div>
            <p className="text-3xl font-bold text-brand-primary mb-2">{spinsAvailable}</p>
            {spinsAvailable > 0 ? (
              <p className="text-sm text-green-600 font-semibold">Ready to spin!</p>
            ) : (
              <p className="text-sm text-brand-secondary">Earn more referrals</p>
            )}
          </div>
        </div>

        {/* Active Contest Banner */}
        <div className="mb-6">
          <ActiveContest />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Left Column */}
          <div className="space-y-6">
            <MilestoneProgress 
              type="REFERRALS" 
              currentValue={stats.completedReferrals} 
            />
            
            <ReferralBadges />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ReferralLeaderboard />
            
            {spinsAvailable > 0 && (
              <div className="bg-white rounded-xl shadow-md border border-brand-accent/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-6 h-6 text-brand-primary animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <h3 className="text-xl font-bold text-brand-dark">
                    Spin the Wheel!
                  </h3>
                </div>
                <SpinWheel />
              </div>
            )}

            {/* Rewards Preview */}
            <div className="bg-white rounded-xl shadow-md border border-brand-accent/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                  <h3 className="text-xl font-bold text-brand-dark">Available Rewards</h3>
                </div>
                <Link href="/rewards" className="text-sm text-brand-primary hover:text-brand-secondary font-medium">
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-brand-light border border-brand-accent/10 rounded-lg text-center hover:shadow-md transition-all">
                  <p className="text-xs text-brand-secondary mb-1">Discount</p>
                  <p className="text-lg font-bold text-brand-dark">5-20% Off</p>
                  <p className="text-xs text-brand-secondary">100-600 pts</p>
                </div>
                <div className="p-3 bg-brand-light border border-brand-accent/10 rounded-lg text-center hover:shadow-md transition-all">
                  <p className="text-xs text-brand-secondary mb-1">Delivery</p>
                  <p className="text-lg font-bold text-brand-dark">1-5 Free</p>
                  <p className="text-xs text-brand-secondary">150-600 pts</p>
                </div>
                <div className="p-3 bg-brand-light border border-brand-accent/10 rounded-lg text-center hover:shadow-md transition-all">
                  <p className="text-xs text-brand-secondary mb-1">Gift Card</p>
                  <p className="text-lg font-bold text-brand-dark">KES 500+</p>
                  <p className="text-xs text-brand-secondary">1000+ pts</p>
                </div>
                <div className="p-3 bg-brand-light border border-brand-accent/10 rounded-lg text-center hover:shadow-md transition-all">
                  <p className="text-xs text-brand-secondary mb-1">Special</p>
                  <p className="text-lg font-bold text-brand-dark">Badges</p>
                  <p className="text-xs text-brand-secondary">2500 pts</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="bg-white rounded-xl shadow-md border border-brand-accent/20 p-8 mb-8">
          <h3 className="text-2xl font-bold text-brand-dark mb-4 text-center">
            Share Your Referral Link
          </h3>
          
          <div className="max-w-2xl mx-auto mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={stats.referralLink}
                readOnly
                className="flex-1 px-4 py-3 border border-brand-accent/20 rounded-lg bg-brand-light"
              />
              <button
                onClick={() => copyToClipboard(stats.referralLink)}
                className="px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-all"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={`https://wa.me/?text=Join me on this amazing platform! Use my referral code ${stats.referralCode} and get rewards. ${stats.referralLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all"
            >
              WhatsApp
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=Join me and get amazing rewards! Use code ${stats.referralCode}: ${stats.referralLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all"
            >
              Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${stats.referralLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all"
            >
              Facebook
            </a>
            <a
              href={`mailto:?subject=Join me!&body=Use my referral code ${stats.referralCode} to get rewards: ${stats.referralLink}`}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all"
            >
              Email
            </a>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl shadow-md border border-brand-accent/20 p-8">
          <h3 className="text-2xl font-bold text-brand-dark mb-6 text-center">
            How Referral Rewards Work
          </h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h4 className="font-bold text-brand-dark mb-2">1. Share</h4>
              <p className="text-sm text-brand-secondary">
                Share your referral code or link with friends
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h4 className="font-bold text-brand-dark mb-2">2. They Sign Up</h4>
              <p className="text-sm text-brand-secondary">
                Friend signs up using your code and earns 50 points
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h4 className="font-bold text-brand-dark mb-2">3. First Purchase</h4>
              <p className="text-sm text-brand-secondary">
                When they make first purchase, you both earn 200 points!
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h4 className="font-bold text-brand-dark mb-2">4. Earn Rewards</h4>
              <p className="text-sm text-brand-secondary">
                Redeem points, earn badges, win contests, and more!
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/category/food"
            className="inline-block px-8 py-4 bg-brand-primary text-white rounded-lg font-bold text-lg hover:bg-brand-secondary transition-all shadow-lg"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
