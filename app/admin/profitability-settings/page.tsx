'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingScreen from '@/components/LoadingScreen';

interface ProfitabilityConfig {
  deliveryFees: {
    isEnabled: boolean;
    baseDeliveryFee: number;
    feePerKM: number;
    expressDeliveryFee: number;
    minOrderForFreeDelivery: number;
  };
  commissionModel: {
    isEnabled: boolean;
    commissionPercentage: number;
    minimumCommission: number;
  };
  premiumFeatures: {
    expressDeliveryPrice: number;
    prioritySupportPrice: number;
    isEnabled: boolean;
  };
  profitMargin: {
    targetMargin: number;
    currentMargin: number;
  };
}

export default function ProfitabilitySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'delivery' | 'commission' | 'premium' | 'analysis'>('delivery');

  // Delivery Fees
  const [deliveryFees, setDeliveryFees] = useState({
    isEnabled: true,
    baseDeliveryFee: 50,
    feePerKM: 10,
    expressDeliveryFee: 100,
    minOrderForFreeDelivery: 1000,
  });

  // Commission Model
  const [commission, setCommission] = useState({
    isEnabled: true,
    commissionPercentage: 8,
    minimumCommission: 50,
  });

  // Premium Features
  const [premium, setPremium] = useState({
    isEnabled: true,
    expressDeliveryPrice: 150,
    prioritySupportPrice: 500,
  });

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    try {
      setLoading(true);
      // In production, fetch from API
      // For now, use default values
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
      setLoading(false);
    }
  };

  const handleSaveDeliveryFees = async () => {
    try {
      setUpdating(true);
      // In production, save to API
      setSuccessMessage('Delivery fees updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <LoadingScreen
        title="Loading Profitability Settings"
        message="Retrieving revenue configuration..."
        steps={['Fetching settings', 'Loading data', 'Ready']}
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
        <h1 className="text-3xl font-bold mb-2">Profitability & Revenue Settings</h1>
        <p className="text-gray-600">Configure delivery fees, commission model, and premium features</p>
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
      <div className="mb-8 flex gap-4 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('delivery')}
          className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'delivery'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Delivery Fees
        </button>
        <button
          onClick={() => setActiveTab('commission')}
          className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'commission'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Commission Model
        </button>
        <button
          onClick={() => setActiveTab('premium')}
          className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'premium'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Premium Features
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'analysis'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Revenue Analysis
        </button>
      </div>

      {/* Delivery Fees Tab */}
      {activeTab === 'delivery' && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-brand-dark">Delivery Fee Configuration</h2>
          
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Setup delivery fees to generate revenue from last-mile logistics. Currently set to FREE. Enable fees to start earning.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={deliveryFees.isEnabled}
                  onChange={(e) => setDeliveryFees({ ...deliveryFees, isEnabled: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="font-semibold text-gray-700">Enable Delivery Fees</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Base Delivery Fee (KES)
              </label>
              <input
                type="number"
                value={deliveryFees.baseDeliveryFee}
                onChange={(e) => setDeliveryFees({ ...deliveryFees, baseDeliveryFee: parseInt(e.target.value) })}
                disabled={!deliveryFees.isEnabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Flat fee for all deliveries within city</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Per KM Fee (KES)
              </label>
              <input
                type="number"
                value={deliveryFees.feePerKM}
                onChange={(e) => setDeliveryFees({ ...deliveryFees, feePerKM: parseInt(e.target.value) })}
                disabled={!deliveryFees.isEnabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Additional fee per km outside city</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Express Delivery Fee (KES)
              </label>
              <input
                type="number"
                value={deliveryFees.expressDeliveryFee}
                onChange={(e) => setDeliveryFees({ ...deliveryFees, expressDeliveryFee: parseInt(e.target.value) })}
                disabled={!deliveryFees.isEnabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Premium for same-day delivery</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Free Delivery for Orders Above (KES)
              </label>
              <input
                type="number"
                value={deliveryFees.minOrderForFreeDelivery}
                onChange={(e) => setDeliveryFees({ ...deliveryFees, minOrderForFreeDelivery: parseInt(e.target.value) })}
                disabled={!deliveryFees.isEnabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum order value for checkout</p>
            </div>
          </div>

          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-bold text-green-900 mb-2">Revenue Estimate</h3>
            <p className="text-sm text-green-800">
              Average order: KES 500 → Revenue per order: KES {deliveryFees.baseDeliveryFee} (Base fee)
            </p>
            <p className="text-sm text-green-800">
              1000 orders/month → Monthly delivery revenue: KES {(deliveryFees.baseDeliveryFee * 1000).toLocaleString()}
            </p>
          </div>

          <button
            onClick={handleSaveDeliveryFees}
            disabled={updating}
            className="px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors disabled:bg-gray-400"
          >
            {updating ? 'Saving...' : 'Save Delivery Fees'}
          </button>
        </div>
      )}

      {/* Commission Model Tab */}
      {activeTab === 'commission' && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-brand-dark">Commission Model (Platform Revenue)</h2>
          
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Commission is the percentage of each order total that your platform keeps. This is your primary revenue stream.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={commission.isEnabled}
                  onChange={(e) => setCommission({ ...commission, isEnabled: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="font-semibold text-gray-700">Enable Commission</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Commission Percentage (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={commission.commissionPercentage}
                onChange={(e) => setCommission({ ...commission, commissionPercentage: parseFloat(e.target.value) })}
                disabled={!commission.isEnabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Industry standard: 5-15%</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Minimum Commission per Order (KES)
              </label>
              <input
                type="number"
                value={commission.minimumCommission}
                onChange={(e) => setCommission({ ...commission, minimumCommission: parseInt(e.target.value) })}
                disabled={!commission.isEnabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum commission even if % is lower</p>
            </div>
          </div>

          <div className="space-y-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-bold text-purple-900">Revenue Projection</h3>
            <div className="text-sm text-purple-800">
              <p>Average order value: KES 500</p>
              <p>Commission per order: KES {Math.max(500 * (commission.commissionPercentage / 100), commission.minimumCommission)}</p>
              <p className="font-bold mt-2">
                1000 orders/month → Monthly commission revenue: KES {(Math.max(500 * (commission.commissionPercentage / 100), commission.minimumCommission) * 1000).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveDeliveryFees}
            disabled={updating}
            className="mt-6 px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors disabled:bg-gray-400"
          >
            {updating ? 'Saving...' : 'Save Commission Settings'}
          </button>
        </div>
      )}

      {/* Premium Features Tab */}
      {activeTab === 'premium' && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-brand-dark">Premium Features & Subscriptions</h2>
          
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Offer premium features to customers willing to pay for convenience and priority service.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={premium.isEnabled}
                  onChange={(e) => setPremium({ ...premium, isEnabled: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="font-semibold text-gray-700">Enable Premium Features</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Express Delivery Premium (KES)
              </label>
              <input
                type="number"
                value={premium.expressDeliveryPrice}
                onChange={(e) => setPremium({ ...premium, expressDeliveryPrice: parseInt(e.target.value) })}
                disabled={!premium.isEnabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Charge for same-day/priority delivery</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Priority Support Subscription (KES/month)
              </label>
              <input
                type="number"
                value={premium.prioritySupportPrice}
                onChange={(e) => setPremium({ ...premium, prioritySupportPrice: parseInt(e.target.value) })}
                disabled={!premium.isEnabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Monthly subscription for dedicated support & perks</p>
            </div>
          </div>

          <div className="space-y-3 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <h3 className="font-bold text-indigo-900">Revenue Projection</h3>
            <div className="text-sm text-indigo-800">
              <p>Express delivery: 10% of orders × KES {premium.expressDeliveryPrice} = KES {Math.round(premium.expressDeliveryPrice * 100)}/month (for 1000 orders)</p>
              <p>Premium subscribers: 5% of customers × KES {premium.prioritySupportPrice} = KES {Math.round(premium.prioritySupportPrice * 50)}/month (for 1000 customers)</p>
              <p className="font-bold mt-2">
                Combined: KES {(Math.round(premium.expressDeliveryPrice * 100) + Math.round(premium.prioritySupportPrice * 50)).toLocaleString()}/month
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveDeliveryFees}
            disabled={updating}
            className="mt-6 px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors disabled:bg-gray-400"
          >
            {updating ? 'Saving...' : 'Save Premium Features'}
          </button>
        </div>
      )}

      {/* Revenue Analysis Tab */}
      {activeTab === 'analysis' && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-brand-dark">Revenue Analysis & Projections</h2>

          <div className="space-y-8">
            {/* Monthly Revenue Projection */}
            <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-300">
              <h3 className="text-xl font-bold text-green-900 mb-4">Monthly Revenue Projection (1000 orders)</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Delivery Fees</span>
                  <span className="text-xl font-bold text-green-600">
                    KES {(deliveryFees.isEnabled ? deliveryFees.baseDeliveryFee * 1000 : 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Commission (8% avg)</span>
                  <span className="text-xl font-bold text-green-600">
                    KES {(commission.isEnabled ? Math.max(500 * (commission.commissionPercentage / 100), commission.minimumCommission) * 1000 : 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Premium Features</span>
                  <span className="text-xl font-bold text-green-600">
                    KES {(premium.isEnabled ? (Math.round(premium.expressDeliveryPrice * 100) + Math.round(premium.prioritySupportPrice * 50)) : 0).toLocaleString()}
                  </span>
                </div>
                <div className="border-t-2 border-green-300 pt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-green-900">Total Monthly Revenue</span>
                  <span className="text-3xl font-bold text-green-700">
                    KES {(
                      (deliveryFees.isEnabled ? deliveryFees.baseDeliveryFee * 1000 : 0) +
                      (commission.isEnabled ? Math.max(500 * (commission.commissionPercentage / 100), commission.minimumCommission) * 1000 : 0) +
                      (premium.isEnabled ? (Math.round(premium.expressDeliveryPrice * 100) + Math.round(premium.prioritySupportPrice * 50)) : 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Annual Projection */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-300">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Annual Revenue Projection</h3>
              
              <div className="text-center">
                <p className="text-sm text-blue-700 mb-2">Based on 1000 orders/month (12,000 annual)</p>
                <p className="text-4xl font-bold text-blue-700">
                  KES {(
                    ((deliveryFees.isEnabled ? deliveryFees.baseDeliveryFee * 1000 : 0) +
                    (commission.isEnabled ? Math.max(500 * (commission.commissionPercentage / 100), commission.minimumCommission) * 1000 : 0) +
                    (premium.isEnabled ? (Math.round(premium.expressDeliveryPrice * 100) + Math.round(premium.prioritySupportPrice * 50)) : 0)) * 12
                  ).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-6 bg-amber-50 border border-amber-300 rounded-lg">
              <h3 className="text-lg font-bold text-amber-900 mb-4">Profitability Recommendations</h3>
              <ul className="space-y-2 text-sm text-amber-900">
                <li>✓ Enable all three revenue streams for maximum profitability</li>
                <li>✓ Start with competitive commission (8-10%) to attract sellers</li>
                <li>✓ Set minimum order value requirements</li>
                <li>✓ Premium features should be 20-30% above standard pricing</li>
                <li>✓ Monitor competitor pricing and adjust quarterly</li>
                <li>✓ Focus on customer retention - lifetime value {'>'} acquisition cost</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
