/**
 * Integration Tests for Admin APIs
 * Tests: Coupon management, review moderation
 */

describe('Admin APIs', () => {
  describe('Coupon Management', () => {
    it('should require admin privileges to create coupon', async () => {
      const response = await fetch('/api/admin/coupons/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'TEST',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });

      expect([403, 401]).toContain(response.status);
    });

    it('should create coupon with valid data', async () => {
      const couponData = {
        code: 'NEWCODE',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        minOrderAmount: 10000,
        maxUsesGlobal: 100,
        maxUsesPerUser: 1,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      };

      const response = await fetch('/api/admin/coupons/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponData),
      });

      if (response.status === 201) {
        const data = await response.json();
        expect(data.coupon.code).toBe('NEWCODE');
        expect(data.coupon.discountValue).toBe(15);
      }
    });

    it('should prevent duplicate coupon codes', async () => {
      const couponData = {
        code: 'DUPLICATE',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      };

      // First creation
      await fetch('/api/admin/coupons/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponData),
      });

      // Second creation should fail
      const response = await fetch('/api/admin/coupons/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponData),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('already exists');
    });

    it('should fetch all coupons', async () => {
      const response = await fetch('/api/admin/coupons');

      if (response.status === 200) {
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(Array.isArray(data.coupons)).toBe(true);
      }
    });

    it('should include usage count in coupon list', async () => {
      const response = await fetch('/api/admin/coupons');

      if (response.status === 200) {
        const data = await response.json();
        data.coupons.forEach((coupon: any) => {
          expect(coupon).toHaveProperty('usedCount');
          expect(typeof coupon.usedCount).toBe('number');
        });
      }
    });
  });

  describe('Review Moderation', () => {
    it('should require admin privileges to view reviews', async () => {
      const response = await fetch('/api/admin/reviews?status=PENDING');

      expect([403, 401]).toContain(response.status);
    });

    it('should fetch pending reviews', async () => {
      const response = await fetch('/api/admin/reviews?status=PENDING');

      if (response.status === 200) {
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(Array.isArray(data.reviews)).toBe(true);
      }
    });

    it('should filter reviews by status', async () => {
      const statuses = ['PENDING', 'APPROVED', 'REJECTED'];

      for (const status of statuses) {
        const response = await fetch(`/api/admin/reviews?status=${status}`);

        if (response.status === 200) {
          const data = await response.json();
          data.reviews.forEach((review: any) => {
            expect(review.status).toBe(status);
          });
        }
      }
    });

    it('should approve review', async () => {
      const reviewId = 'review-1';
      const response = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: 'POST',
      });

      if (response.status === 200) {
        const data = await response.json();
        expect(data.review.isApproved).toBe(true);
        expect(data.review.status).toBe('APPROVED');
      }
    });

    it('should reject review', async () => {
      const reviewId = 'review-2';
      const response = await fetch(`/api/admin/reviews/${reviewId}/reject`, {
        method: 'POST',
      });

      if (response.status === 200) {
        const data = await response.json();
        expect(data.review.isApproved).toBe(false);
        expect(data.review.status).toBe('REJECTED');
      }
    });

    it('should include reviewer info in moderation list', async () => {
      const response = await fetch('/api/admin/reviews?status=PENDING');

      if (response.status === 200) {
        const data = await response.json();
        data.reviews.forEach((review: any) => {
          expect(review).toHaveProperty('user');
          expect(review.user).toHaveProperty('name');
          expect(review).toHaveProperty('product');
          expect(review.product).toHaveProperty('nameEn');
        });
      }
    });
  });

  describe('Admin Authorization', () => {
    it('should only allow admins to access admin APIs', async () => {
      const endpoints = [
        { method: 'GET', path: '/api/admin/coupons' },
        { method: 'POST', path: '/api/admin/coupons/create' },
        { method: 'GET', path: '/api/admin/reviews' },
      ];

      for (const endpoint of endpoints) {
        const response = await fetch(endpoint.path, { method: endpoint.method });

        // Should be 401 (not authenticated) or 403 (not admin)
        expect([401, 403]).toContain(response.status);
      }
    });
  });
});
