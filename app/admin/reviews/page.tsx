'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Review {
  id: string;
  productId: string;
  title: string;
  comment?: string;
  rating: number;
  user: { name: string };
  status: string;
  createdAt: string;
}

export default function ReviewsAdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  useEffect(() => {
    if (!session?.user?.isPlatformAdmin) {
      router.push('/');
      return;
    }
    fetchReviews();
  }, [session, router, filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/reviews?status=${filter}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (err) {
      console.error('Error approving review:', err);
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/reject`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (err) {
      console.error('Error rejecting review:', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading reviews...</div>;
  }

  return (
    <div className="min-h-screen bg-brand-light py-12">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-dark">Review Moderation</h1>
          <p className="text-brand-secondary">Approve or reject customer reviews</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8 border-b border-brand-accent/20">
          {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                filter === status
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-brand-secondary hover:text-brand-dark'
              }`}
            >
              {status === 'PENDING' ? '⏳ Pending' : status === 'APPROVED' ? '✓ Approved' : '✗ Rejected'}
            </button>
          ))}
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-lg border border-brand-accent/20 text-brand-secondary">
              No {filter.toLowerCase()} reviews
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-lg border border-brand-accent/20 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-brand-dark">{review.user.name}</span>
                      <span className="text-xs px-2 py-1 bg-brand-light rounded text-brand-secondary">
                        {[...Array(review.rating)].map(() => '★').join('')}
                      </span>
                    </div>
                    <h3 className="font-bold text-brand-dark mb-1">{review.title}</h3>
                    {review.comment && (
                      <p className="text-sm text-brand-secondary mb-2">{review.comment}</p>
                    )}
                    <p className="text-xs text-brand-secondary">
                      {new Date(review.createdAt).toLocaleDateString('en-KE')}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      review.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : review.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {review.status}
                  </span>
                </div>

                {review.status === 'PENDING' && (
                  <div className="flex gap-2 pt-4 border-t border-brand-accent/20">
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition-colors"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleReject(review.id)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition-colors"
                    >
                      ✗ Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
