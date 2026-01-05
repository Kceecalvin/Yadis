/**
 * Integration Tests for Orders API
 * Tests: Track order, get order history, update status
 */

describe('Orders API', () => {
  describe('GET /api/orders/tracking/[orderId]', () => {
    it('should fetch order tracking information', async () => {
      const orderId = 'order-123';
      const response = await fetch(`/api/orders/tracking/${orderId}`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.order).toHaveProperty('id');
      expect(data.order).toHaveProperty('totalCents');
      expect(data.tracking).toHaveProperty('currentStatus');
      expect(data.tracking).toHaveProperty('timeline');
    });

    it('should return timeline with correct structure', async () => {
      const response = await fetch(`/api/orders/tracking/order-123`);
      const data = await response.json();

      expect(Array.isArray(data.tracking.timeline)).toBe(true);
      data.tracking.timeline.forEach((step: any) => {
        expect(step).toHaveProperty('step');
        expect(step).toHaveProperty('label');
        expect(step).toHaveProperty('completed');
        expect(step).toHaveProperty('icon');
        expect(typeof step.completed).toBe('boolean');
      });
    });

    it('should show pending status for new orders', async () => {
      const response = await fetch(`/api/orders/tracking/order-new`);
      const data = await response.json();

      expect(data.tracking.currentStatus).toBe('PENDING');
      expect(data.tracking.timeline[0].completed).toBe(false);
    });

    it('should show completed timeline for delivered orders', async () => {
      const response = await fetch(`/api/orders/tracking/order-delivered`);
      const data = await response.json();

      expect(data.tracking.currentStatus).toBe('DELIVERED');
      expect(data.tracking.timeline[data.tracking.timeline.length - 1].completed).toBe(true);
    });

    it('should include order items with prices', async () => {
      const response = await fetch(`/api/orders/tracking/order-123`);
      const data = await response.json();

      expect(Array.isArray(data.order.items)).toBe(true);
      data.order.items.forEach((item: any) => {
        expect(item).toHaveProperty('product');
        expect(item).toHaveProperty('quantity');
        expect(item).toHaveProperty('priceCents');
      });
    });

    it('should return 404 for non-existent order', async () => {
      const response = await fetch(`/api/orders/tracking/order-doesnt-exist`);

      expect(response.status).toBe(404);
    });

    it('should return 403 for unauthorized user', async () => {
      // Test accessing another user's order
      const response = await fetch(`/api/orders/tracking/order-other-user`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/orders/user', () => {
    it('should fetch user order history', async () => {
      const response = await fetch('/api/orders/user');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.orders)).toBe(true);
      expect(data).toHaveProperty('total');
    });

    it('should include tracking info in order history', async () => {
      const response = await fetch('/api/orders/user');
      const data = await response.json();

      data.orders.forEach((order: any) => {
        expect(order).toHaveProperty('id');
        expect(order).toHaveProperty('status');
        expect(order).toHaveProperty('totalCents');
        expect(order).toHaveProperty('createdAt');
        expect(order).toHaveProperty('tracking');
      });
    });

    it('should return empty list for user with no orders', async () => {
      const response = await fetch('/api/orders/user');
      const data = await response.json();

      expect(Array.isArray(data.orders)).toBe(true);
      expect(data.total).toBe(0);
    });

    it('should require authentication', async () => {
      const response = await fetch('/api/orders/user');

      expect(response.status).toBe(401);
    });

    it('should sort orders by creation date descending', async () => {
      const response = await fetch('/api/orders/user');
      const data = await response.json();

      for (let i = 0; i < data.orders.length - 1; i++) {
        const current = new Date(data.orders[i].createdAt).getTime();
        const next = new Date(data.orders[i + 1].createdAt).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });

    it('should limit results to last 50 orders', async () => {
      const response = await fetch('/api/orders/user');
      const data = await response.json();

      expect(data.orders.length).toBeLessThanOrEqual(50);
    });
  });

  describe('Order Status Updates', () => {
    it('should track order through all statuses', async () => {
      const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

      for (const status of statuses) {
        const response = await fetch(`/api/orders/tracking/order-lifecycle`);
        const data = await response.json();

        // Verify status progression makes sense
        if (data.tracking.currentStatus === 'DELIVERED') {
          expect(data.tracking.timeline.every((s: any) => s.completed)).toBe(true);
        }
      }
    });
  });
});
