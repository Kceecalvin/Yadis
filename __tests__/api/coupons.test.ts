/**
 * Integration Tests for Coupons API
 * Tests: Validate coupon, apply coupon, check limits
 */

describe('Coupons API', () => {
  describe('POST /api/coupons/validate', () => {
    it('should validate valid percentage coupon', async () => {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'SAVE10',
          orderAmount: 50000, // 500 KES
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.discount).toHaveProperty('originalAmount');
      expect(data.discount).toHaveProperty('discountAmount');
      expect(data.discount).toHaveProperty('finalAmount');
    });

    it('should calculate correct discount for percentage', async () => {
      const orderAmount = 100000; // 1000 KES

      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'SAVE10', // 10% discount
          orderAmount,
        }),
      });

      const data = await response.json();
      expect(data.discount.discountAmount).toBe(10000); // 100 KES
      expect(data.discount.finalAmount).toBe(90000); // 900 KES
    });

    it('should reject invalid coupon code', async () => {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'INVALID999',
          orderAmount: 50000,
        }),
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toContain('Invalid');
    });

    it('should reject expired coupon', async () => {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'EXPIRED_COUPON',
          orderAmount: 50000,
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('expired');
    });

    it('should reject coupon below minimum order amount', async () => {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'MIN_ORDER_1000',
          orderAmount: 50000, // 500 KES, but min is 1000 KES
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Minimum');
    });

    it('should reject coupon when usage limit reached', async () => {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'LIMITED_USES',
          orderAmount: 50000,
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('usage limit');
    });

    it('should calculate fixed amount discount correctly', async () => {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'FIXED_100',
          orderAmount: 150000, // 1500 KES
        }),
      });

      const data = await response.json();
      expect(data.discount.discountAmount).toBe(10000); // Fixed 100 KES
      expect(data.discount.finalAmount).toBe(140000); // 1400 KES
    });

    it('should not allow discount greater than order amount', async () => {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'HUGE_DISCOUNT', // 50000 KES discount
          orderAmount: 20000, // 200 KES order
        }),
      });

      const data = await response.json();
      expect(data.discount.finalAmount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('POST /api/coupons/apply', () => {
    it('should apply coupon to order', async () => {
      const response = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponId: 'coupon-1',
          orderId: 'order-1',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.usage).toHaveProperty('id');
    });

    it('should require authentication', async () => {
      // Test without valid session
      const response = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponId: 'coupon-1',
          orderId: 'order-1',
        }),
      });

      expect(response.status).toBe(401);
    });
  });
});
