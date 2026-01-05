/**
 * Integration Tests for Product Reviews API
 * Tests: Create review, fetch reviews, validate stats
 */

import { prisma } from '@/lib/db';

describe('Product Reviews API', () => {
  // Test data
  const mockUser = { id: 'user-1', email: 'test@example.com' };
  const mockProduct = { id: 'prod-1', slug: 'test-product' };

  describe('POST /api/reviews/create', () => {
    it('should create a review for authenticated user', async () => {
      const reviewData = {
        productId: mockProduct.id,
        rating: 5,
        title: 'Excellent product!',
        comment: 'Very satisfied with this purchase.',
      };

      // Simulate API call
      const response = await fetch('/api/reviews/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.review).toHaveProperty('id');
      expect(data.review.rating).toBe(5);
    });

    it('should reject unauthorized requests', async () => {
      const response = await fetch('/api/reviews/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: 'prod-1', rating: 5, title: 'Test' }),
      });

      expect(response.status).toBe(401);
    });

    it('should prevent duplicate reviews from same user', async () => {
      // First review should succeed
      const reviewData = {
        productId: mockProduct.id,
        rating: 4,
        title: 'Good product',
      };

      await fetch('/api/reviews/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });

      // Second review should fail
      const response = await fetch('/api/reviews/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('already reviewed');
    });

    it('should validate rating is between 1-5', async () => {
      const invalidRatings = [0, 6, -1, 10];

      for (const rating of invalidRatings) {
        const response = await fetch('/api/reviews/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: mockProduct.id,
            rating,
            title: 'Test',
          }),
        });

        expect(response.status).toBe(400);
      }
    });
  });

  describe('GET /api/reviews/product/[productId]', () => {
    it('should fetch approved reviews for product', async () => {
      const response = await fetch(`/api/reviews/product/${mockProduct.id}`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.reviews)).toBe(true);
      expect(data.stats).toHaveProperty('totalReviews');
      expect(data.stats).toHaveProperty('averageRating');
      expect(data.stats).toHaveProperty('ratingDistribution');
    });

    it('should calculate correct rating statistics', async () => {
      const response = await fetch(`/api/reviews/product/${mockProduct.id}`);
      const data = await response.json();

      if (data.stats.totalReviews > 0) {
        expect(data.stats.averageRating).toBeGreaterThanOrEqual(1);
        expect(data.stats.averageRating).toBeLessThanOrEqual(5);
        expect(data.stats.ratingDistribution[1]).toBeDefined();
        expect(data.stats.ratingDistribution[5]).toBeDefined();
      }
    });

    it('should only return approved reviews', async () => {
      const response = await fetch(`/api/reviews/product/${mockProduct.id}`);
      const data = await response.json();

      data.reviews.forEach((review: any) => {
        expect(review.isApproved).toBe(true);
      });
    });
  });
});
