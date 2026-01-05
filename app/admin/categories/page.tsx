'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/admin/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-brand-light py-10"><div className="mx-auto max-w-6xl px-4">Loading...</div></div>;
  }
  
  return (
    <div className="min-h-screen bg-brand-light py-10">
      <div className="mx-auto max-w-6xl px-4">
        {/* Back Button */}
        <Link href="/admin" className="text-brand-primary hover:text-brand-secondary mb-4 inline-block font-semibold">
          ← Back to Admin Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">Manage Categories</h1>
            <p className="text-brand-secondary mt-2">Organize your product categories</p>
          </div>
          <Link 
            href="/admin/categories/new" 
            className="px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors"
          >
            + New Category
          </Link>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c) => (
              <div 
                key={c.id} 
                className="bg-white rounded-lg shadow-md border border-brand-accent/20 hover:shadow-lg transition-all p-6"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-brand-dark">{c.titleEn}</h3>
                  <p className="text-xs text-brand-secondary mt-1">Slug: <code className="bg-brand-light px-2 py-1 rounded">{c.slug}</code></p>
                </div>
                
                <div className="flex gap-2">
                  <Link 
                    href={`/admin/categories/${c.id}`} 
                    className="flex-1 px-3 py-2 bg-brand-primary/10 text-brand-primary rounded font-semibold hover:bg-brand-primary/20 transition-colors text-center text-sm"
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this category?')) {
                        // Delete action would go here
                      }
                    }}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded font-semibold hover:bg-red-200 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-8 text-center">
            <p className="text-brand-secondary mb-4">No categories yet</p>
            <Link
              href="/admin/categories/new"
              className="inline-block px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors"
            >
              Create Your First Category
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
