'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingScreen from '@/components/LoadingScreen';

interface CustomerReferral {
  referralCode: string;
  totalReferred: number;
  convertedReferrals: number;
  freeDeliveriesEarned: number;
  freeDeliveriesAvailable: number;
  freeDeliveriesUsed: number;
  referralLink: string;
}

export default function ReferralPage() {
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState<CustomerReferral | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      // In production, fetch user's referral data
      // For now, use mock data
      const mockData: CustomerReferral = {
        referralCode: 'JOHN' + Math.random().toString(36).substr(2, 5).toUpperCase(),
        totalReferred: 8,
        convertedReferrals: 5,
        freeDeliveriesEarned: 25,
        freeDeliveriesAvailable: 18,
        freeDeliveriesUsed: 7,
        referralLink: `${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=JOHN123`,
      };
      setReferralData(mockData);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <LoadingScreen
        title="Loading Referral Program"
        message="Retrieving your referral data..."
        steps={['Fetching referral info', 'Loading statistics', 'Ready']}
      />
    );
  }

  if (!referralData) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Referral Program</h1>
          <p className="text-gray-600">Unable to load referral data. Please try again later.</p>
          <Link href="/" className="mt-4 inline-block px-6 py-2 bg-brand-primary text-white rounded-lg">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-12">
        <Link href="/" className="inline-flex items-center text-brand-primary hover:text-brand-secondary mb-6">
          <span className="mr-2">←</span>
          Back to Home
        </Link>
        <h1 className="text-4xl font-bold mb-2">Earn Free Deliveries</h1>
        <p className="text-gray-600 text-lg">Invite friends and get 5 free deliveries for each successful referral</p>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-lg p-8 mb-12 border border-blue-200">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">How It Works</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-1">Share Your Code</h3>
              <p className="text-blue-800">Copy your unique referral code and share it with friends via WhatsApp, email, or social media</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-1">Friend Signs Up</h3>
              <p className="text-blue-800">They sign up using your referral code</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-1">They Make First Purchase</h3>
              <p className="text-blue-800">When they order for at least KES 100</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-1">Get Free Deliveries</h3>
              <p className="text-blue-800">You instantly receive 5 free deliveries - no minimum order required</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="text-3xl font-bold text-blue-600 mb-1">{referralData.referralCode}</div>
          <div className="text-gray-600 text-sm">Your Code</div>
          <button
            onClick={() => copyToClipboard(referralData.referralCode)}
            className="mt-3 px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold hover:bg-blue-200 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="text-3xl font-bold text-green-600 mb-1">{referralData.convertedReferrals}</div>
          <div className="text-gray-600 text-sm">Successful Referrals</div>
          <div className="text-xs text-gray-500 mt-2">{referralData.totalReferred - referralData.convertedReferrals} pending</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="text-3xl font-bold text-purple-600 mb-1">{referralData.freeDeliveriesAvailable}</div>
          <div className="text-gray-600 text-sm">Free Deliveries</div>
          <div className="text-xs text-gray-500 mt-2">Available to use</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="text-3xl font-bold text-orange-600 mb-1">{referralData.freeDeliveriesUsed}</div>
          <div className="text-gray-600 text-sm">Already Used</div>
          <div className="text-xs text-gray-500 mt-2">Out of {referralData.freeDeliveriesEarned}</div>
        </div>
      </div>

      {/* Share Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
        <h2 className="text-2xl font-bold text-brand-dark mb-6">Share Your Referral</h2>

        <div className="space-y-6">
          {/* Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Your Referral Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralData.referralCode}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono"
              />
              <button
                onClick={() => copyToClipboard(referralData.referralCode)}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Referral Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralData.referralLink}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={() => copyToClipboard(referralData.referralLink)}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Social Sharing */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Share via</label>
            <div className="flex gap-3 flex-wrap">
              <a
                href={`https://wa.me/?text=Join me on this amazing delivery app! Use my referral code ${referralData.referralCode} and get discounts. ${referralData.referralLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=Great delivery service! Use my code ${referralData.referralCode} for rewards: ${referralData.referralLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
              >
                Twitter
              </a>
              <a
                href={`mailto:?subject=Join me on the delivery app&body=I'm using this amazing delivery service. Use my referral code ${referralData.referralCode} to get rewards: ${referralData.referralLink}`}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Email
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?quote=Great delivery app! Use code ${referralData.referralCode}&u=${referralData.referralLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow p-8 mb-12">
        <h2 className="text-2xl font-bold text-brand-dark mb-6">Your Free Delivery Balance</h2>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-700">Earned Deliveries</span>
              <span className="font-bold text-purple-600">{referralData.freeDeliveriesEarned}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-purple-600 h-3 rounded-full transition-all"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-700">Used Deliveries</span>
              <span className="font-bold text-orange-600">{referralData.freeDeliveriesUsed}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-orange-600 h-3 rounded-full transition-all"
                style={{
                  width: `${(referralData.freeDeliveriesUsed / referralData.freeDeliveriesEarned) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-700">Available Deliveries</span>
              <span className="font-bold text-green-600">{referralData.freeDeliveriesAvailable}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all"
                style={{
                  width: `${(referralData.freeDeliveriesAvailable / referralData.freeDeliveriesEarned) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg shadow-lg p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-2">Ready to Start Earning?</h3>
        <p className="mb-6 text-opacity-90">Share your referral code and start getting free deliveries today!</p>
        <Link
          href="/shop"
          className="inline-block px-8 py-3 bg-white text-brand-primary rounded-lg font-bold hover:bg-gray-100 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
