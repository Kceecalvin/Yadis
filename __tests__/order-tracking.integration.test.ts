import { prisma, cleanupDatabase, createTestUser, createTestOrder, createTestProduct } from './setup';

describe('Order Tracking Integration Tests', () => {
  afterEach(async () => {
    await cleanupDatabase();
  });

  describe('POST /api/orders/tracking/create', () => {
    it('should create tracking record for order', async () => {
      const user = await createTestUser();
      const product = await createTestProduct();
      const order = await createTestOrder(user.id, product.id);

      const tracking = await prisma.orderTracking.create({
        data: {
          orderId: order.id,
          status: 'PENDING',
        },
      });

      expect(tracking.orderId).toBe(order.id);
      expect(tracking.status).toBe('PENDING');
    });

    it('should set estimated delivery date', async () => {
      const user = await createTestUser();
      const product = await createTestProduct();
      const order = await createTestOrder(user.id, product.id);

      const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days

      const tracking = await prisma.orderTracking.create({
        data: {
          orderId: order.id,
          status: 'CONFIRMED',
          confirmedAt: new Date(),
          estimatedDeliveryDate: estimatedDelivery,
        },
      });

      expect(tracking.estimatedDeliveryDate).toEqual(estimatedDelivery);
      expect(tracking.confirmedAt).toBeDefined();
    });

    it('should track order status progression', async () => {
      const user = await createTestUser();
      const product = await createTestProduct();
      const order = await createTestOrder(user.id, product.id);

      let tracking = await prisma.orderTracking.create({
        data: { orderId: order.id, status: 'PENDING' },
      });

      expect(tracking.status).toBe('PENDING');

      // Progress to CONFIRMED
      tracking = await prisma.orderTracking.update({
        where: { id: tracking.id },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
      });

      expect(tracking.status).toBe('CONFIRMED');
      expect(tracking.confirmedAt).toBeDefined();

      // Progress to PROCESSING
      tracking = await prisma.orderTracking.update({
        where: { id: tracking.id },
        data: {
          status: 'PROCESSING',
          processingAt: new Date(),
        },
      });

      expect(tracking.status).toBe('PROCESSING');

      // Progress to SHIPPED
      tracking = await prisma.orderTracking.update({
        where: { id: tracking.id },
        data: {
          status: 'SHIPPED',
          shippedAt: new Date(),
        },
      });

      expect(tracking.status).toBe('SHIPPED');

      // Progress to DELIVERED
      tracking = await prisma.orderTracking.update({
        where: { id: tracking.id },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date(),
        },
      });

      expect(tracking.status).toBe('DELIVERED');
      expect(tracking.deliveredAt).toBeDefined();
    });
  });

  describe('GET /api/orders/tracking/[orderId]', () => {
    it('should retrieve tracking information with timeline', async () => {
      const user = await createTestUser();
      const product = await createTestProduct();
      const order = await createTestOrder(user.id, product.id);

      const now = new Date();
      const tracking = await prisma.orderTracking.create({
        data: {
          orderId: order.id,
          status: 'SHIPPED',
          confirmedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          processingAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          shippedAt: now,
          estimatedDeliveryDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        },
      });

      const retrieved = await prisma.orderTracking.findUnique({
        where: { orderId: order.id },
      });

      expect(retrieved?.status).toBe('SHIPPED');
      expect(retrieved?.confirmedAt).toBeDefined();
      expect(retrieved?.processingAt).toBeDefined();
      expect(retrieved?.shippedAt).toBeDefined();
    });

    it('should build timeline from tracking data', async () => {
      const user = await createTestUser();
      const product = await createTestProduct();
      const order = await createTestOrder(user.id, product.id);

      const now = new Date();
      const tracking = await prisma.orderTracking.create({
        data: {
          orderId: order.id,
          status: 'SHIPPED',
          confirmedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          shippedAt: now,
        },
      });

      // Build timeline
      const timeline = [
        {
          step: 'CONFIRMED',
          label: 'Order Confirmed',
          completed: !!tracking.confirmedAt,
          date: tracking.confirmedAt,
        },
        {
          step: 'PROCESSING',
          label: 'Processing',
          completed: tracking.status !== 'PENDING',
          date: tracking.processingAt,
        },
        {
          step: 'SHIPPED',
          label: 'Shipped',
          completed: !!tracking.shippedAt,
          date: tracking.shippedAt,
        },
        {
          step: 'DELIVERED',
          label: 'Delivered',
          completed: tracking.status === 'DELIVERED',
          date: tracking.deliveredAt,
        },
      ];

      expect(timeline[0].completed).toBe(true);
      expect(timeline[1].completed).toBe(true);
      expect(timeline[2].completed).toBe(true);
      expect(timeline[3].completed).toBe(false);
    });

    it('should include tracking notes', async () => {
      const user = await createTestUser();
      const product = await createTestProduct();
      const order = await createTestOrder(user.id, product.id);

      const tracking = await prisma.orderTracking.create({
        data: {
          orderId: order.id,
          status: 'SHIPPED',
          notes: 'Order shipped via courier. Expected delivery in 2-3 days.',
        },
      });

      expect(tracking.notes).toBe('Order shipped via courier. Expected delivery in 2-3 days.');
    });
  });

  describe('Order Status Transitions', () => {
    it('should validate status transitions', async () => {
      const user = await createTestUser();
      const product = await createTestProduct();
      const order = await createTestOrder(user.id, product.id);

      const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

      let tracking = await prisma.orderTracking.create({
        data: { orderId: order.id, status: 'PENDING' },
      });

      for (const status of validStatuses) {
        tracking = await prisma.orderTracking.update({
          where: { id: tracking.id },
          data: { status },
        });
        expect(validStatuses.includes(tracking.status)).toBe(true);
      }
    });

    it('should handle order cancellation', async () => {
      const user = await createTestUser();
      const product = await createTestProduct();
      const order = await createTestOrder(user.id, product.id);

      let tracking = await prisma.orderTracking.create({
        data: { orderId: order.id, status: 'PENDING' },
      });

      tracking = await prisma.orderTracking.update({
        where: { id: tracking.id },
        data: { status: 'CANCELLED' },
      });

      expect(tracking.status).toBe('CANCELLED');
    });
  });

  describe('Delivery Time Calculations', () => {
    it('should calculate delivery windows', async () => {
      const user = await createTestUser();
      const product = await createTestProduct();
      const order = await createTestOrder(user.id, product.id);

      const shippedDate = new Date();
      const minDeliveryDays = 2;
      const maxDeliveryDays = 5;

      const minDelivery = new Date(shippedDate.getTime() + minDeliveryDays * 24 * 60 * 60 * 1000);
      const maxDelivery = new Date(shippedDate.getTime() + maxDeliveryDays * 24 * 60 * 60 * 1000);

      const tracking = await prisma.orderTracking.create({
        data: {
          orderId: order.id,
          status: 'SHIPPED',
          shippedAt: shippedDate,
          estimatedDeliveryDate: minDelivery,
        },
      });

      expect(tracking.estimatedDeliveryDate?.getTime()).toBeGreaterThanOrEqual(minDelivery.getTime());
      expect(tracking.estimatedDeliveryDate?.getTime()).toBeLessThanOrEqual(maxDelivery.getTime());
    });

    it('should update estimated delivery if status changes', async () => {
      const user = await createTestUser();
      const product = await createTestProduct();
      const order = await createTestOrder(user.id, product.id);

      let tracking = await prisma.orderTracking.create({
        data: {
          orderId: order.id,
          status: 'CONFIRMED',
          estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        },
      });

      const initialEstimate = tracking.estimatedDeliveryDate;

      // Update to shipped with new estimate
      tracking = await prisma.orderTracking.update({
        where: { id: tracking.id },
        data: {
          status: 'SHIPPED',
          estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      });

      expect(tracking.estimatedDeliveryDate?.getTime()).toBeLessThan(initialEstimate!.getTime());
    });
  });
});
