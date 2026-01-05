'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingScreen from '@/components/LoadingScreen';

interface RewardConfig {
  id: string;
  pointsPerKES: number;
  minOrderForPoints: number;
  maxPointsPerOrder: number;
  pointExpirationDays: number;
  tiers: RewardTier[];
  redemptionOptions: RedemptionOption[];
}

interface RewardTier {
  id: string;
  name: string;
  minPoints: number;
  bonusMultiplier: number;
  description: string;
}

interface RedemptionOption {
  id: string;
  pointsCost: number;
  reward: string;
  discountAmount?: number;
  freeItem?: string;
  description: string;
  isActive: boolean;
}

export default function RewardConfigurationPage() {
  const [config, setConfig] = useState<RewardConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'points' | 'tiers' | 'redemption'>('points');
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Points system form
  const [pointsPerKES, setPointsPerKES] = useState(1);
  const [minOrderForPoints, setMinOrderForPoints] = useState(100);
  const [maxPointsPerOrder, setMaxPointsPerOrder] = useState(1000);
  const [pointExpirationDays, setPointExpirationDays] = useState(365);

  // Tier form
  const [newTier, setNewTier] = useState({ name: '', minPoints: 0, bonusMultiplier: 1, description: '' });
  const [tiers, setTiers] = useState<RewardTier[]>([]);

  // Redemption form
  const [newRedemption, setNewRedemption] = useState({
    pointsCost: 0,
    reward: '',
    discountAmount: 0,
    description: '',
  });
  const [redemptions, setRedemptions] = useState<RedemptionOption[]>([]);

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/reward-config');
      if (!response.ok) throw new Error('Failed to fetch reward configuration');
      const data = await response.json();
      setConfig(data);
      setPointsPerKES(data.pointsPerKES);
      setMinOrderForPoints(data.minOrderForPoints);
      setMaxPointsPerOrder(data.maxPointsPerOrder);
      setPointExpirationDays(data.pointExpirationDays);
      setTiers(data.tiers);
      setRedemptions(data.redemptionOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePointsSystem = async () => {
    try {
      setUpdating(true);
      const response = await fetch('/api/admin/reward-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pointsPerKES,
          minOrderForPoints,
          maxPointsPerOrder,
          pointExpirationDays,
        }),
      });

      if (!response.ok) throw new Error('Failed to update configuration');
      setSuccessMessage('Points system updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchConfiguration();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update configuration');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddTier = async () => {
    if (!newTier.name || newTier.minPoints < 0) {
      setError('Please fill all tier fields correctly');
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch('/api/admin/reward-config/tiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTier),
      });

      if (!response.ok) throw new Error('Failed to add tier');
      setSuccessMessage('Tier added successfully!');
      setNewTier({ name: '', minPoints: 0, bonusMultiplier: 1, description: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchConfiguration();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add tier');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveTier = async (tierId: string) => {
    if (!confirm('Are you sure you want to remove this tier?')) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/reward-config/tiers/${tierId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove tier');
      setSuccessMessage('Tier removed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchConfiguration();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove tier');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddRedemption = async () => {
    if (!newRedemption.reward || newRedemption.pointsCost <= 0) {
      setError('Please fill all redemption fields correctly');
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch('/api/admin/reward-config/redemptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRedemption),
      });

      if (!response.ok) throw new Error('Failed to add redemption option');
      setSuccessMessage('Redemption option added successfully!');
      setNewRedemption({ pointsCost: 0, reward: '', discountAmount: 0, description: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchConfiguration();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add redemption option');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <LoadingScreen
        title="Loading Reward Configuration"
        message="Retrieving reward system settings..."
        steps={['Fetching configuration', 'Loading data', 'Ready']}
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
        <h1 className="text-3xl font-bold mb-2">Reward System Configuration</h1>
        <p className="text-gray-600">Configure points, tiers, and redemption options</p>
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
          onClick={() => setActiveTab('points')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'points'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Points System
        </button>
        <button
          onClick={() => setActiveTab('tiers')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'tiers'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Customer Tiers
        </button>
        <button
          onClick={() => setActiveTab('redemption')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'redemption'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Redemption Options
        </button>
      </div>

      {/* Points System Tab */}
      {activeTab === 'points' && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-brand-dark">Points Earning System</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Points Per KES 100 Spent
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={pointsPerKES}
                onChange={(e) => setPointsPerKES(parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">Example: 1 point = KES 100 spent</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Minimum Order for Points (KES)
              </label>
              <input
                type="number"
                value={minOrderForPoints}
                onChange={(e) => setMinOrderForPoints(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Maximum Points Per Order
              </label>
              <input
                type="number"
                value={maxPointsPerOrder}
                onChange={(e) => setMaxPointsPerOrder(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">Caps maximum points earned per order</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Points Expiration (Days)
              </label>
              <input
                type="number"
                value={pointExpirationDays}
                onChange={(e) => setPointExpirationDays(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">Points expire after this many days</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-2">Preview</h3>
            <p className="text-sm text-blue-800">
              Customer spends KES 1,000: Earns {Math.min((1000 / 100) * pointsPerKES, maxPointsPerOrder)} points
            </p>
          </div>

          <button
            onClick={handleUpdatePointsSystem}
            disabled={updating}
            className="mt-8 px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors disabled:bg-gray-400"
          >
            {updating ? 'Saving...' : 'Save Points System'}
          </button>
        </div>
      )}

      {/* Customer Tiers Tab */}
      {activeTab === 'tiers' && (
        <div className="space-y-8">
          {/* Add New Tier */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-6 text-brand-dark">Add New Tier</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tier Name</label>
                <input
                  type="text"
                  placeholder="e.g., Gold"
                  value={newTier.name}
                  onChange={(e) => setNewTier({ ...newTier, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Points</label>
                <input
                  type="number"
                  placeholder="e.g., 1000"
                  value={newTier.minPoints}
                  onChange={(e) => setNewTier({ ...newTier, minPoints: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bonus Multiplier</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 1.5"
                  value={newTier.bonusMultiplier}
                  onChange={(e) => setNewTier({ ...newTier, bonusMultiplier: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">e.g., 1.5x points earned</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  placeholder="e.g., Elite members get exclusive perks"
                  value={newTier.description}
                  onChange={(e) => setNewTier({ ...newTier, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleAddTier}
              disabled={updating}
              className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {updating ? 'Adding...' : 'Add Tier'}
            </button>
          </div>

          {/* Existing Tiers */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-6 text-brand-dark">Existing Tiers</h2>
            
            {tiers.length === 0 ? (
              <p className="text-gray-600">No tiers configured yet</p>
            ) : (
              <div className="space-y-4">
                {tiers.map((tier) => (
                  <div key={tier.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-brand-dark">{tier.name}</h3>
                      <p className="text-sm text-gray-600">Minimum Points: {tier.minPoints}</p>
                      <p className="text-sm text-gray-600">Bonus Multiplier: {tier.bonusMultiplier}x</p>
                      {tier.description && <p className="text-sm text-gray-700 mt-2">{tier.description}</p>}
                    </div>
                    <button
                      onClick={() => handleRemoveTier(tier.id)}
                      className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Redemption Options Tab */}
      {activeTab === 'redemption' && (
        <div className="space-y-8">
          {/* Add New Redemption */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-6 text-brand-dark">Add Redemption Option</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Points Cost</label>
                <input
                  type="number"
                  placeholder="e.g., 500"
                  value={newRedemption.pointsCost}
                  onChange={(e) => setNewRedemption({ ...newRedemption, pointsCost: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reward Type</label>
                <select
                  value={newRedemption.reward}
                  onChange={(e) => setNewRedemption({ ...newRedemption, reward: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                >
                  <option value="">Select reward type</option>
                  <option value="discount">Discount</option>
                  <option value="free-item">Free Item</option>
                  <option value="cashback">Cashback</option>
                </select>
              </div>

              {newRedemption.reward === 'discount' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Amount (KES)</label>
                  <input
                    type="number"
                    placeholder="e.g., 100"
                    value={newRedemption.discountAmount}
                    onChange={(e) => setNewRedemption({ ...newRedemption, discountAmount: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  placeholder="e.g., KES 100 off on next order"
                  value={newRedemption.description}
                  onChange={(e) => setNewRedemption({ ...newRedemption, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleAddRedemption}
              disabled={updating}
              className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {updating ? 'Adding...' : 'Add Redemption Option'}
            </button>
          </div>

          {/* Existing Redemptions */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-6 text-brand-dark">Active Redemption Options</h2>
            
            {redemptions.length === 0 ? (
              <p className="text-gray-600">No redemption options configured yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Points Cost</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Reward</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Description</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redemptions.map((option) => (
                      <tr key={option.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-blue-600">{option.pointsCost}</td>
                        <td className="px-4 py-3 text-gray-700">{option.reward}</td>
                        <td className="px-4 py-3 text-gray-700">{option.description}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${option.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {option.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
