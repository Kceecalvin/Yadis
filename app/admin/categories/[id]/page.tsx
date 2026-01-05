'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: string;
  titleEn: string;
  slug: string;
  descriptionEn?: string;
}

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    async function fetchCategory() {
      try {
        const response = await fetch(`/api/admin/categories/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch category');
        const data = await response.json();
        setFormData({
          titleEn: data.titleEn,
          slug: data.slug,
          descriptionEn: data.descriptionEn || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load category');
      } finally {
        setLoading(false);
      }
    }

    fetchCategory();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/categories/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update category');
      }

      router.push('/admin/categories');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-light py-10">
        <div className="mx-auto max-w-2xl px-4">
          <p className="text-center text-brand-secondary">Loading category...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light py-10">
      <div className="mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/categories" className="text-brand-primary hover:text-brand-secondary mb-4 inline-block font-semibold">
            ← Back to Categories
          </Link>
          <h1 className="text-3xl font-bold text-brand-dark">Edit Category</h1>
          <p className="text-brand-secondary mt-2">Update category details</p>
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
              placeholder="e.g., Fresh Vegetables"
              className="w-full border border-brand-accent/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white/80"
              required
            />
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
              disabled
            />
            <p className="text-xs text-brand-secondary mt-2">
              Slug cannot be changed (used in URLs)
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
              placeholder="Brief description of this category"
              rows={4}
              className="w-full border border-brand-accent/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white/80"
            />
          </div>

          {/* Preview */}
          <div className="mb-8 p-4 bg-brand-light rounded-lg border border-brand-accent/20">
            <p className="text-xs font-bold text-brand-dark mb-2">Preview</p>
            <div className="bg-white p-3 rounded border border-brand-accent/20">
              <h3 className="font-bold text-brand-dark">{formData.titleEn}</h3>
              <p className="text-xs text-brand-secondary mt-1">
                {formData.descriptionEn || 'No description'}
              </p>
              <p className="text-xs text-brand-secondary/60 mt-2">
                URL: /category/{formData.slug}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href="/admin/categories"
              className="flex-1 px-6 py-3 bg-brand-light border border-brand-accent/20 text-brand-dark rounded-xl font-bold hover:bg-brand-light/60 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
