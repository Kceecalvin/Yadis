'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewPromotionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderAmount: 0,
    startDate: '',
    endDate: '',
  });

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          discountValue: parseInt(formData.discountValue.toString()),
          minOrderAmount: parseInt(formData.minOrderAmount.toString()) || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create promotion');
      }

      router.push('/admin/promotions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light py-10">
      <div className="mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/promotions" className="text-brand-primary hover:text-brand-secondary mb-4 inline-block">
            ← Back to Promotions
          </Link>
          <h1 className="text-3xl font-bold text-brand-dark">Create New Promotion</h1>
          <p className="text-brand-secondary mt-2">Add a promotional campaign or advertisement</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-brand-dark mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Meet & Greet - 100/200 KES"
              className="w-full border border-brand-accent/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-brand-dark mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the promotion"
              rows={3}
              className="w-full border border-brand-accent/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {/* Image URL */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-brand-dark mb-2">
              Image URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full border border-brand-accent/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              required
            />
            {formData.imageUrl && (
              <div className="mt-3 rounded-lg overflow-hidden border border-brand-accent/20">
                <img src={formData.imageUrl} alt="Preview" className="w-full h-48 object-cover" />
              </div>
            )}
          </div>

          {/* Discount Type */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-brand-dark mb-2">
              Discount Type <span className="text-red-500">*</span>
            </label>
            <select
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              className="w-full border border-brand-accent/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED_AMOUNT">Fixed Amount (KES)</option>
            </select>
          </div>

          {/* Discount Value */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-brand-dark mb-2">
              Discount Value <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="discountValue"
              value={formData.discountValue}
              onChange={handleChange}
              placeholder="e.g., 10 or 500"
              className="w-full border border-brand-accent/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              required
            />
            <p className="text-xs text-brand-secondary mt-2">
              {formData.discountType === 'PERCENTAGE' ? 'Percentage value (e.g., 10 for 10%)' : 'Amount in KES (e.g., 500 for KES 500)'}
            </p>
          </div>

          {/* Minimum Order Amount */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-brand-dark mb-2">
              Minimum Order Amount (KES)
            </label>
            <input
              type="number"
              name="minOrderAmount"
              value={formData.minOrderAmount}
              onChange={handleChange}
              placeholder="e.g., 1000 (optional)"
              className="w-full border border-brand-accent/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            <p className="text-xs text-brand-secondary mt-2">
              Leave empty for no minimum
            </p>
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full border border-brand-accent/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full border border-brand-accent/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Promotion'}
            </button>
            <Link
              href="/admin/promotions"
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
