'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingScreen from '@/components/LoadingScreen';

interface RewardCatalogItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  value: number;
  minSpend: number;
  quantity: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminRewardsPage() {
  const { data: session, status } = useSession();
  const [rewards, setRewards] = useState<RewardCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    value: 10000,
    minSpend: 300000,
    quantity: 100,
    isActive: true,
  });
  const [message, setMessage] = useState('');

  if (status === 'loading') {
    return (
      <LoadingScreen
        title="Loading Admin Panel"
        message="Checking permissions..."
        steps={['Verifying access', 'Loading data']}
      />
    );
  }

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await fetch('/api/rewards/catalog');
      if (response.ok) {
        const data = await response.json();
        setRewards(data);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('/api/rewards/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          value: parseInt(formData.value.toString()),
          minSpend: parseInt(formData.minSpend.toString()),
          quantity: parseInt(formData.quantity.toString()),
        }),
      });

      if (response.ok) {
        setMessage('✓ Reward created successfully!');
        resetForm();
        fetchRewards();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const error = await response.json();
        setMessage(`✗ ${error.error || 'Failed to create reward'}`);
      }
    } catch (error) {
      setMessage('✗ Error creating reward');
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      value: 10000,
      minSpend: 300000,
      quantity: 100,
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE');
  };

  return (
    <div className="min-h-screen bg-brand-light">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h1 className="text-4xl font-bold mb-2">Rewards Management</h1>
          <p className="text-brand-light/80">Create and manage reward catalog items</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-brand-secondary">Loading rewards...</p>
          </div>
        ) : (
          <>
            {/* Add Reward Button */}
            <div className="mb-8">
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors"
              >
                {showForm ? '✕ Cancel' : '+ Add New Reward'}
              </button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
              <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-8 mb-8">
                <h2 className="text-2xl font-bold text-brand-dark mb-6">Create New Reward</h2>

                {message && (
                  <div
                    className={`mb-6 p-4 rounded-lg ${
                      message.includes('✓')
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                    }`}
                  >
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-brand-dark mb-2">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., 100 KES Free Item"
                        required
                        className="w-full border border-brand-accent/30 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-brand-dark mb-2">
                        Reward Value (KES) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="value"
                        value={formData.value / 100}
                        onChange={(e) =>
                          setFormData({ ...formData, value: parseInt(e.target.value) * 100 })
                        }
                        placeholder="100"
                        required
                        className="w-full border border-brand-accent/30 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-brand-dark mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe what this reward is"
                      rows={3}
                      className="w-full border border-brand-accent/30 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-brand-dark mb-2">Image URL</label>
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      placeholder="https://..."
                      className="w-full border border-brand-accent/30 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-brand-dark mb-2">
                        Minimum Spend (KES) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="minSpend"
                        value={formData.minSpend / 100}
                        onChange={(e) =>
                          setFormData({ ...formData, minSpend: parseInt(e.target.value) * 100 })
                        }
                        placeholder="3000"
                        required
                        className="w-full border border-brand-accent/30 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-brand-dark mb-2">
                        Quantity Available <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({ ...formData, quantity: parseInt(e.target.value) })
                        }
                        placeholder="100"
                        required
                        className="w-full border border-brand-accent/30 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-5 h-5 rounded border-brand-accent/30 text-brand-primary cursor-pointer"
                    />
                    <label className="text-sm font-semibold text-brand-dark cursor-pointer">Active</label>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors"
                    >
                      Create Reward
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-6 py-3 border-2 border-brand-primary text-brand-primary rounded-lg font-semibold hover:bg-brand-primary hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Rewards List */}
            <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 overflow-hidden">
              <div className="px-6 py-4 border-b border-brand-accent/20">
                <h2 className="text-xl font-bold text-brand-dark">Reward Catalog ({rewards.length})</h2>
              </div>

              {rewards.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-brand-light border-b border-brand-accent/20">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-brand-dark">Title</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-brand-dark">Value</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-brand-dark">Min Spend</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-brand-dark">Stock</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-brand-dark">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-brand-dark">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rewards.map((reward, index) => (
                        <tr
                          key={reward.id}
                          className={`border-b border-brand-accent/10 ${index % 2 === 0 ? 'bg-white' : 'bg-brand-light/30'}`}
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-brand-dark">{reward.title}</p>
                              <p className="text-xs text-brand-secondary">{reward.description}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-brand-primary">
                            {formatPrice(reward.value)}
                          </td>
                          <td className="px-6 py-4 text-brand-secondary">{formatPrice(reward.minSpend)}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                reward.quantity > 10
                                  ? 'bg-green-100 text-green-700'
                                  : reward.quantity > 0
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {reward.quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                reward.isActive
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {reward.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-brand-secondary">
                            {formatDate(reward.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-brand-secondary mb-4">No rewards created yet</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors"
                  >
                    Create First Reward
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
