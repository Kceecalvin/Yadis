'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingScreen from '@/components/LoadingScreen';

interface ReferralCode {
  id: string;
  code: string;
  referrerId: string;
  referrerName: string;
  referrerEmail: string;
  createdAt: string;
  totalReferred: number;
  activeReferred: number;
  freeDeliveriesEarned: number;
  freeDeliveriesUsed: number;
  status: 'active' | 'inactive';
}

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  convertedReferrals: number;
  totalFreeDeliveries: number;
  topReferrers: ReferralCode[];
}

export default function ReferralSystemPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'referrers' | 'settings'>('overview');
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<ReferralCode[]>([]);
  const [updating, setUpdating] = useState(false);

  // Settings
  const [freeDeliveries, setFreeDeliveries] = useState(5);
  const [minOrderAmount, setMinOrderAmount] = useState(100);
  const [maxReferralsPerCustomer, setMaxReferralsPerCustomer] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, referralsRes] = await Promise.all([
        fetch('/api/admin/referral-system/stats'),
        fetch('/api/admin/referral-system/referrals'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (referralsRes.ok) {
        const referralsData = await referralsRes.json();
        setReferrals(referralsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setUpdating(true);
      const response = await fetch('/api/admin/referral-system/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freeDeliveries,
          minOrderAmount,
          maxReferralsPerCustomer,
        }),
      });

      if (!response.ok) throw new Error('Failed to save settings');
      setSuccessMessage('Referral settings updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <LoadingScreen
        title="Loading Referral System"
        message="Retrieving referral data and analytics..."
        steps={['Fetching referrals', 'Loading statistics', 'Ready']}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center text-brand-primary hover:text-brand-secondary mb-6">
          <span className="mr-2">←</span>
          Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Referral System</h1>
        <p className="text-gray-600">Manage customer referrals and discount rewards</p>
      </div>

      {successMessage && (
        <div className="mb-6 bg-green-100 text-green-800 p-4 rounded-lg border border-green-300">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-100 text-red-800 p-4 rounded-lg border border-red-300">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-8 flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'overview'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('referrers')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'referrers'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Top Referrers
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'settings'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          {/* Statistics Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-blue-600 mb-1">{stats.totalReferrals}</div>
              <div className="text-gray-600 text-sm">Total Referrals</div>
              <div className="text-xs text-gray-500 mt-2">All-time referrals</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.pendingReferrals}</div>
              <div className="text-gray-600 text-sm">Pending</div>
              <div className="text-xs text-gray-500 mt-2">Awaiting first purchase</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-green-600 mb-1">{stats.convertedReferrals}</div>
              <div className="text-gray-600 text-sm">Converted</div>
              <div className="text-xs text-gray-500 mt-2">Made first purchase</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-purple-600 mb-1">{stats.totalFreeDeliveries}</div>
              <div className="text-gray-600 text-sm">Free Deliveries</div>
              <div className="text-xs text-gray-500 mt-2">Total earned</div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow p-8 border border-blue-200">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">How the Referral System Works</h2>
            <div className="space-y-3 text-blue-800">
              <div className="flex gap-3">
                <span className="font-bold text-blue-600 text-lg">1</span>
                <p>Customer A gets a unique referral code</p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-blue-600 text-lg">2</span>
                <p>Customer A shares code with friends (Customer B, C, D, etc)</p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-blue-600 text-lg">3</span>
                <p>When referred friend makes their first purchase, activation complete</p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-blue-600 text-lg">4</span>
                <p>Customer A immediately gets 5 free deliveries credited</p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-blue-600 text-lg">5</span>
                <p>Free deliveries can be used on any future order</p>
              </div>
            </div>
          </div>

          {/* Revenue Impact */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg shadow p-8 border border-green-200">
            <h2 className="text-2xl font-bold text-green-900 mb-4">Revenue Impact</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-green-700 mb-1">Cost per Referral</p>
                <p className="text-3xl font-bold text-green-600">KES 500</p>
                <p className="text-xs text-green-600">(5 deliveries × KES 100)</p>
              </div>
              <div>
                <p className="text-sm text-green-700 mb-1">Current Total Cost</p>
                <p className="text-3xl font-bold text-green-600">
                  KES {(stats.convertedReferrals * 500).toLocaleString()}
                </p>
                <p className="text-xs text-green-600">{stats.convertedReferrals} converted referrals</p>
              </div>
              <div>
                <p className="text-sm text-green-700 mb-1">Customer Lifetime Value Increase</p>
                <p className="text-3xl font-bold text-green-600">+150%</p>
                <p className="text-xs text-green-600">More repeat orders from referrals</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Referrers Tab */}
      {activeTab === 'referrers' && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-brand-dark">Top Referrers</h2>

          {referrals.length === 0 ? (
            <p className="text-gray-600">No referrers yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left font-bold text-gray-700">Referrer</th>
                    <th className="px-4 py-3 text-center font-bold text-gray-700">Referral Code</th>
                    <th className="px-4 py-3 text-center font-bold text-gray-700">Total Referred</th>
                    <th className="px-4 py-3 text-center font-bold text-gray-700">Converted</th>
                    <th className="px-4 py-3 text-center font-bold text-gray-700">Free Deliveries</th>
                    <th className="px-4 py-3 text-center font-bold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral, index) => (
                    <tr key={referral.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-brand-dark">{referral.referrerName}</p>
                          <p className="text-sm text-gray-600">{referral.referrerEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-mono">
                          {referral.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">{referral.totalReferred}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
                          {referral.activeReferred}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="text-sm">
                          <p className="font-bold text-purple-600">{referral.freeDeliveriesEarned}</p>
                          <p className="text-xs text-gray-600">{referral.freeDeliveriesUsed} used</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            referral.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {referral.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-brand-dark">Referral System Configuration</h2>

          <div className="space-y-8">
            {/* Free Deliveries */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Free Deliveries per Referral
              </label>
              <input
                type="number"
                min="1"
                value={freeDeliveries}
                onChange={(e) => setFreeDeliveries(parseInt(e.target.value))}
                className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                Number of free deliveries referrer gets when referred customer makes first purchase
              </p>
            </div>

            {/* Minimum Order Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Minimum Order Amount for Referral Activation (KES)
              </label>
              <input
                type="number"
                min="0"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(parseInt(e.target.value))}
                className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                Minimum order value to count as valid referral conversion
              </p>
            </div>

            {/* Max Referrals */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Maximum Referrals per Customer
              </label>
              <input
                type="number"
                min="1"
                value={maxReferralsPerCustomer}
                onChange={(e) => setMaxReferralsPerCustomer(parseInt(e.target.value))}
                className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                Limit referrals per customer to prevent abuse
              </p>
            </div>

            {/* Preview */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-bold text-blue-900 mb-2">Preview</h3>
              <p className="text-sm text-blue-800">
                When a referred customer makes a KES {minOrderAmount}+ purchase, referrer gets {freeDeliveries} free deliveries
              </p>
              <p className="text-sm text-blue-800 mt-2">
                Each referrer can earn rewards from up to {maxReferralsPerCustomer} successful referrals
              </p>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={updating}
              className="px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors disabled:bg-gray-400"
            >
              {updating ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
