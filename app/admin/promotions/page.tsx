'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

interface Promotion {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  type: string;
  targetUrl?: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  views: number;
  clicks: number;
  createdAt: string;
}

export default function PromotionsAdminPage() {
  const { data: session, status } = useSession();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  useEffect(() => {
    async function fetchPromotions() {
      try {
        const response = await fetch('/api/admin/promotions');
        if (response.ok) {
          const data = await response.json();
          setPromotions(data);
        }
      } catch (error) {
        console.error('Error fetching promotions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPromotions();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      PROMOTION: 'bg-blue-100 text-blue-800',
      ADVERTISEMENT: 'bg-purple-100 text-purple-800',
      EVENT: 'bg-green-100 text-green-800',
      FLASH_SALE: 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-brand-light py-10">
      <div className="mx-auto max-w-7xl px-4">
        {/* Back Button */}
        <Link href="/admin" className="text-brand-primary hover:text-brand-secondary mb-4 inline-block font-semibold">
          ← Back to Admin Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">Manage Promotions</h1>
            <p className="text-brand-secondary mt-2">Create and manage promotional campaigns</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/promotions/carousel-manager"
              className="px-6 py-3 bg-brand-light border border-brand-primary/30 text-brand-primary rounded-lg font-semibold hover:bg-brand-primary/10 transition-colors"
            >
              📸 Carousel Manager
            </Link>
            <Link
              href="/admin/promotions/new"
              className="px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors"
            >
              + New Promotion
            </Link>
          </div>
        </div>

        {/* Promotions Table */}
        {loading ? (
          <div className="text-center py-10">
            <p className="text-brand-secondary">Loading promotions...</p>
          </div>
        ) : promotions.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-brand-light border-b border-brand-accent/20">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-brand-dark">Title</th>
                    <th className="px-6 py-4 text-left font-semibold text-brand-dark">Type</th>
                    <th className="px-6 py-4 text-left font-semibold text-brand-dark">Status</th>
                    <th className="px-6 py-4 text-left font-semibold text-brand-dark">Start Date</th>
                    <th className="px-6 py-4 text-left font-semibold text-brand-dark">End Date</th>
                    <th className="px-6 py-4 text-left font-semibold text-brand-dark">Views</th>
                    <th className="px-6 py-4 text-left font-semibold text-brand-dark">Clicks</th>
                    <th className="px-6 py-4 text-left font-semibold text-brand-dark">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map((promo) => (
                    <tr key={promo.id} className="border-b border-brand-accent/10 hover:bg-brand-light/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-brand-dark">{promo.title}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getTypeColor(promo.type)}`}>
                          {promo.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${promo.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {promo.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-brand-secondary">{formatDate(promo.startDate)}</td>
                      <td className="px-6 py-4 text-sm text-brand-secondary">{formatDate(promo.endDate)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-brand-primary">{promo.views}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-brand-primary">{promo.clicks}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/promotions/${promo.id}/edit`}
                            className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded text-sm hover:bg-brand-primary/20 transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200 transition-colors"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this promotion?')) {
                                // TODO: Implement delete
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-8 text-center">
            <p className="text-brand-secondary mb-4">No promotions yet</p>
            <Link
              href="/admin/promotions/new"
              className="inline-block px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors"
            >
              Create Your First Promotion
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
