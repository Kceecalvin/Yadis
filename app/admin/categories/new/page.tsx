'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewCategoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    titleEn: '',
    slug: '',
    descriptionEn: '',
  });

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Auto-generate slug from title
      if (name === 'titleEn') {
        updated.slug = value
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '');
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userEmail = session?.user?.email;
      
      console.log('Submitting category with email:', userEmail);
      
      if (!userEmail) {
        throw new Error('You must be signed in to create categories. Please refresh and sign in again.');
      }

      // Include user email for verification
      const requestBody = {
        ...formData,
        userEmail,
      };

      console.log('Request body:', requestBody);

      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create category');
      }

      router.push('/admin/categories');
    } catch (err) {
      console.error('Error:', err);
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
          <Link href="/admin/categories" className="text-brand-primary hover:text-brand-secondary mb-4 inline-block font-semibold">
            ← Back to Categories
          </Link>
          <h1 className="text-3xl font-bold text-brand-dark">Create New Category</h1>
          <p className="text-brand-secondary mt-2">Add a new product category to your store</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg font-semibold">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-brand-dark mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="titleEn"
              value={formData.titleEn}
              onChange={handleChange}
              placeholder="e.g., Fresh Vegetables, Dairy Products, Snacks"
              className="w-full border border-brand-accent/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white/80"
              required
            />
            <p className="text-xs text-brand-secondary mt-2">
              Give your category a clear, descriptive name
            </p>
          </div>

          {/* Slug */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-brand-dark mb-2">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="fresh-vegetables"
              className="w-full border border-brand-accent/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white/80"
              required
            />
            <p className="text-xs text-brand-secondary mt-2">
              Auto-generated from category name (lowercase, hyphenated). Used in URLs.
            </p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-brand-dark mb-2">
              Description
            </label>
            <textarea
              name="descriptionEn"
              value={formData.descriptionEn}
              onChange={handleChange}
              placeholder="Brief description of this category (optional)"
              rows={4}
              className="w-full border border-brand-accent/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white/80"
            />
            <p className="text-xs text-brand-secondary mt-2">
              This helps customers understand what products are in this category
            </p>
          </div>

          {/* Preview */}
          <div className="mb-8 p-4 bg-brand-light rounded-lg border border-brand-accent/20">
            <p className="text-xs font-bold text-brand-dark mb-2">Preview</p>
            <div className="bg-white p-3 rounded border border-brand-accent/20">
              <h3 className="font-bold text-brand-dark">{formData.titleEn || 'Category Name'}</h3>
              <p className="text-xs text-brand-secondary mt-1">
                {formData.descriptionEn || 'Category description will appear here'}
              </p>
              <p className="text-xs text-brand-secondary/60 mt-2">
                URL: /category/{formData.slug || 'slug'}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Category'}
            </button>
            <Link
              href="/admin/categories"
              className="flex-1 px-6 py-3 bg-brand-light border border-brand-accent/20 text-brand-dark rounded-xl font-bold hover:bg-brand-light/60 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md border border-brand-accent/20 p-6">
          <h3 className="font-bold text-brand-dark mb-4">💡 Tips for Creating Categories</h3>
          <ul className="space-y-2 text-sm text-brand-secondary">
            <li>✓ Use clear, descriptive names that customers will understand</li>
            <li>✓ Keep the slug simple and SEO-friendly (no special characters)</li>
            <li>✓ Add a description to help customers find what they're looking for</li>
            <li>✓ Avoid creating too many similar categories</li>
            <li>✓ You can edit categories anytime after creation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
