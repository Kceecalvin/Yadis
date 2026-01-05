'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingScreen from '@/components/LoadingScreen';

interface ReferralAnalytics {
  period: string;
  totalReferrals: number;
  conversionRate: number;
  totalFreeDeliveries: number;
  totalCost: number;
  averageReferralValue: number;
  topReferrers: Array<{
    name: string;
    referrals: number;
    conversions: number;
    freeDeliveries: number;
    conversionRate: number;
  }>;
  dailyReferrals: Array<{
    date: string;
    referrals: number;
    conversions: number;
  }>;
}

export default function ReferralAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<ReferralAnalytics | null>(null);
  const [period, setPeriod] = useState<'7days' | '30days' | '90days'>('30days');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Mock analytics data
      const mockData: ReferralAnalytics = {
        period,
        totalReferrals: 156,
        conversionRate: 72,
        totalFreeDeliveries: 112,
        totalCost: 56000,
        averageReferralValue: 3500,
        topReferrers: [
          { name: 'John Doe', referrals: 12, conversions: 10, freeDeliveries: 50, conversionRate: 83 },
          { name: 'Jane Smith', referrals: 8, conversions: 6, freeDeliveries: 30, conversionRate: 75 },
          { name: 'Mike Johnson', referrals: 7, conversions: 5, freeDeliveries: 25, conversionRate: 71 },
          { name: 'Sarah Williams', referrals: 6, conversions: 4, freeDeliveries: 20, conversionRate: 67 },
          { name: 'David Brown', referrals: 5, conversions: 3, freeDeliveries: 15, conversionRate: 60 },
        ],
        dailyReferrals: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          referrals: Math.floor(Math.random() * 10) + 3,
          conversions: Math.floor(Math.random() * 7) + 1,
        })),
      };
      setAnalytics(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingScreen
        title="Loading Referral Analytics"
        message="Analyzing referral program data..."
        steps={['Fetching metrics', 'Processing data', 'Generating charts']}
      />
    );
  }

  if (!analytics) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-gray-600">Unable to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center text-brand-primary hover:text-brand-secondary mb-6">
          <span className="mr-2">←</span>
          Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Referral Analytics</h1>
        <p className="text-gray-600">Track referral program performance and ROI</p>
      </div>

      {/* Period Selector */}
      <div className="mb-8 flex gap-4">
        {(['7days', '30days', '90days'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              period === p
                ? 'bg-brand-primary text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {p === '7days' ? 'Last 7 Days' : p === '30days' ? 'Last 30 Days' : 'Last 90 Days'}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-600 mb-1">{analytics.totalReferrals}</div>
          <div className="text-gray-600 text-sm">Total Referrals</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600 mb-1">{analytics.conversionRate}%</div>
          <div className="text-gray-600 text-sm">Conversion Rate</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-purple-600 mb-1">{analytics.totalFreeDeliveries}</div>
          <div className="text-gray-600 text-sm">Free Deliveries</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-red-600 mb-1">KES {(analytics.totalCost / 1000).toFixed(0)}K</div>
          <div className="text-gray-600 text-sm">Total Cost</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-orange-600 mb-1">KES {(analytics.averageReferralValue / 1000).toFixed(1)}K</div>
          <div className="text-gray-600 text-sm">Avg Value/Referral</div>
        </div>
      </div>

      {/* ROI Analysis */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Revenue Impact */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-8 border border-green-300">
          <h2 className="text-xl font-bold text-green-900 mb-4">Revenue Impact</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-green-800">Conversions Generated</span>
              <span className="font-bold text-green-600">{Math.round(analytics.totalReferrals * analytics.conversionRate / 100)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-800">Avg Order Value per Conversion</span>
              <span className="font-bold text-green-600">KES {analytics.averageReferralValue.toLocaleString()}</span>
            </div>
            <div className="border-t-2 border-green-300 pt-3 flex justify-between">
              <span className="font-bold text-green-900">Total Revenue Generated</span>
              <span className="text-2xl font-bold text-green-600">
                KES {(Math.round(analytics.totalReferrals * analytics.conversionRate / 100) * analytics.averageReferralValue).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Cost vs Revenue */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-8 border border-blue-300">
          <h2 className="text-xl font-bold text-blue-900 mb-4">ROI Analysis</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-blue-800">Total Cost (Free Deliveries)</span>
              <span className="font-bold text-red-600">KES {analytics.totalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-800">Total Revenue</span>
              <span className="font-bold text-green-600">
                KES {(Math.round(analytics.totalReferrals * analytics.conversionRate / 100) * analytics.averageReferralValue).toLocaleString()}
              </span>
            </div>
            <div className="border-t-2 border-blue-300 pt-3 flex justify-between">
              <span className="font-bold text-blue-900">Net Profit</span>
              <span className="text-2xl font-bold text-blue-600">
                KES {(
                  (Math.round(analytics.totalReferrals * analytics.conversionRate / 100) * analytics.averageReferralValue) - analytics.totalCost
                ).toLocaleString()}
              </span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="font-bold text-blue-900">ROI</span>
              <span className="text-xl font-bold text-purple-600">
                {(
                  ((Math.round(analytics.totalReferrals * analytics.conversionRate / 100) * analytics.averageReferralValue) - analytics.totalCost) / analytics.totalCost * 100
                ).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Referrers */}
      <div className="bg-white rounded-lg shadow p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-brand-dark">Top Referrers</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-bold text-gray-700">Referrer</th>
                <th className="px-4 py-3 text-center font-bold text-gray-700">Total Referrals</th>
                <th className="px-4 py-3 text-center font-bold text-gray-700">Conversions</th>
                <th className="px-4 py-3 text-center font-bold text-gray-700">Conversion Rate</th>
                <th className="px-4 py-3 text-center font-bold text-gray-700">Free Deliveries Earned</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topReferrers.map((referrer, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-brand-dark">
                    <span className="mr-2 text-gray-500">#{index + 1}</span>
                    {referrer.name}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-blue-600">{referrer.referrals}</td>
                  <td className="px-4 py-3 text-center font-bold text-green-600">{referrer.conversions}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-bold">
                      {referrer.conversionRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-orange-600">{referrer.freeDeliveries}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trends */}
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-6 text-brand-dark">Referral Trends</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-bold text-gray-700">Date</th>
                <th className="px-4 py-3 text-center font-bold text-gray-700">New Referrals</th>
                <th className="px-4 py-3 text-center font-bold text-gray-700">Conversions</th>
                <th className="px-4 py-3 text-center font-bold text-gray-700">Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {analytics.dailyReferrals.slice(-7).map((day, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-700">{day.date}</td>
                  <td className="px-4 py-3 text-center font-bold text-blue-600">{day.referrals}</td>
                  <td className="px-4 py-3 text-center font-bold text-green-600">{day.conversions}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-bold">
                      {Math.round((day.conversions / day.referrals) * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
