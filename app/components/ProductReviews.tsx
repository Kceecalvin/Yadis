'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface Review {
  id: string;
  rating: number;
  title: string;
  comment?: string;
  user: { name: string; image?: string };
  createdAt: string;
  helpfulCount: number;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
}

interface Props {
  productId: string;
}

export default function ProductReviews({ productId }: Props) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reviews/product/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      setError('Please sign in to leave a review');
      return;
    }

    if (!formData.title.trim()) {
      setError('Review title is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/reviews/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating: formData.rating,
          title: formData.title,
          comment: formData.comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit review');
        return;
      }

      setSuccess(data.message);
      setFormData({ rating: 5, title: '', comment: '' });
      setShowForm(false);

      // Refresh reviews after 2 seconds
      setTimeout(() => {
        fetchReviews();
        setSuccess(null);
      }, 2000);
    } catch (err) {
      setError('Error submitting review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, size = 'md') => {
    const sizeClass = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${sizeClass} ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const getRatingPercentage = (count: number) => {
    return stats && stats.totalReviews > 0
      ? Math.round((count / stats.totalReviews) * 100)
      : 0;
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-brand-secondary">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="py-12 border-t border-brand-accent/20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-brand-dark">Customer Reviews</h2>
          {session?.user?.id && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors"
            >
              {showForm ? 'Cancel' : 'Write a Review'}
            </button>
          )}
        </div>

        {/* Review Form */}
        {showForm && (
          <div className="mb-8 p-6 bg-white border border-brand-accent/20 rounded-lg">
            <h3 className="text-lg font-bold mb-4 text-brand-dark">Share Your Experience</h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`text-4xl transition-transform hover:scale-110 ${
                        star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Review Title
                </label>
                <input
                  type="text"
                  maxLength={100}
                  placeholder="Summarize your experience"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-brand-accent/20 rounded-lg focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Your Review (Optional)
                </label>
                <textarea
                  maxLength={500}
                  rows={4}
                  placeholder="Tell us more about your experience..."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-4 py-2 border border-brand-accent/20 rounded-lg focus:outline-none focus:border-brand-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="mb-8 grid md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="p-6 bg-white border border-brand-accent/20 rounded-lg">
              <div className="text-center">
                <div className="text-5xl font-bold text-brand-primary mb-2">
                  {stats.averageRating}
                </div>
                <div className="flex justify-center mb-2">{renderStars(Math.round(stats.averageRating as number), 'lg')}</div>
                <p className="text-sm text-brand-secondary">Based on {stats.totalReviews} reviews</p>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="p-6 bg-white border border-brand-accent/20 rounded-lg">
              <h4 className="font-semibold text-brand-dark mb-4">Rating Breakdown</h4>
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-medium text-brand-dark w-12">{rating}★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all"
                      style={{ width: `${getRatingPercentage(stats.ratingDistribution[rating])}%` }}
                    />
                  </div>
                  <span className="text-sm text-brand-secondary w-12 text-right">
                    {getRatingPercentage(stats.ratingDistribution[rating])}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-brand-secondary">
              No reviews yet. Be the first to review this product!
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="p-4 bg-white border border-brand-accent/20 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                    {review.user.image ? (
                      <Image
                        src={review.user.image}
                        alt={review.user.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-brand-primary font-bold">
                        {review.user.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-brand-dark">{review.user.name}</h4>
                        <div className="mt-1">{renderStars(review.rating)}</div>
                      </div>
                      <span className="text-xs text-brand-secondary">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h5 className="font-semibold text-brand-dark mt-2">{review.title}</h5>
                    {review.comment && (
                      <p className="text-sm text-brand-secondary mt-1">{review.comment}</p>
                    )}

                    {/* Helpful */}
                    <div className="mt-3 flex gap-3 text-xs">
                      <button className="text-brand-secondary hover:text-brand-primary transition-colors">
                        👍 Helpful ({review.helpfulCount})
                      </button>
                      <button className="text-brand-secondary hover:text-brand-primary transition-colors">
                        👎 Not Helpful
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
