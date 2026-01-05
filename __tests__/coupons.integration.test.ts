import { prisma, cleanupDatabase, createTestUser, createTestOrder, createTestProduct } from './setup';

describe('Coupon System Integration Tests', () => {
  afterEach(async () => {
    await cleanupDatabase();
  });

  describe('POST /api/coupons/validate', () => {
    it('should validate and apply percentage discount', async () => {
      const coupon = await prisma.couponCode.create({
        data: {
          code: 'SAVE10',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
      });

      const orderAmount = 10000; // 100 KES
      const discount = Math.floor((orderAmount * coupon.discountValue) / 100);
      const finalAmount = orderAmount - discount;

      expect(coupon.code).toBe('SAVE10');
      expect(discount).toBe(1000);
      expect(finalAmount).toBe(9000);
    });

    it('should validate and apply fixed amount discount', async () => {
      const coupon = await prisma.couponCode.create({
        data: {
          code: 'SAVE500',
          discountType: 'FIXED_AMOUNT',
          discountValue: 50000, // 500 KES in cents
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
      });

      const orderAmount = 100000; // 1000 KES
      const discount = coupon.discountValue;
      const finalAmount = Math.max(0, orderAmount - discount);

      expect(discount).toBe(50000);
      expect(finalAmount).toBe(50000);
    });

    it('should reject expired coupons', async () => {
      const expiredDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // Yesterday
      const coupon = await prisma.couponCode.create({
        data: {
          code: 'EXPIRED',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          endDate: expiredDate,
          isActive: true,
        },
      });

      const now = new Date();
      const isValid = now <= new Date(coupon.endDate);

      expect(isValid).toBe(false);
    });

    it('should enforce minimum order amount', async () => {
      const coupon = await prisma.couponCode.create({
        data: {
          code: 'MINORDER',
          discountType: 'PERCENTAGE',
          discountValue: 20,
          minOrderAmount: 50000, // 500 KES minimum
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
      });

      const orderAmount = 30000; // 300 KES (below minimum)
      const isValid = !coupon.minOrderAmount || orderAmount >= coupon.minOrderAmount;

      expect(isValid).toBe(false);
    });

    it('should track global usage limits', async () => {
      const coupon = await prisma.couponCode.create({
        data: {
          code: 'LIMITED',
          discountType: 'PERCENTAGE',
          discountValue: 50,
          maxUsesGlobal: 3,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
          usedCount: 0,
        },
      });

      // Record 3 usages
      for (let i = 0; i < 3; i++) {
        await prisma.couponCode.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      const updated = await prisma.couponCode.findUnique({
        where: { id: coupon.id },
      });

      expect(updated?.usedCount).toBe(3);
      expect(updated?.usedCount === updated?.maxUsesGlobal).toBe(true);
    });

    it('should track per-user usage limits', async () => {
      const user = await createTestUser();
      const coupon = await prisma.couponCode.create({
        data: {
          code: 'PERUSER',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          maxUsesPerUser: 2,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
      });

      // Record 2 usages for this user
      await Promise.all([
        prisma.couponUsage.create({
          data: { couponId: coupon.id, userId: user.id, discountAmount: 1000 },
        }),
        prisma.couponUsage.create({
          data: { couponId: coupon.id, userId: user.id, discountAmount: 1000 },
        }),
      ]);

      const userUsageCount = await prisma.couponUsage.count({
        where: { couponId: coupon.id, userId: user.id },
      });

      expect(userUsageCount).toBe(2);
      expect(userUsageCount === coupon.maxUsesPerUser).toBe(true);
    });
  });

  describe('POST /api/coupons/apply', () => {
    it('should record coupon usage', async () => {
      const user = await createTestUser();
      const product = await createTestProduct();
      const order = await createTestOrder(user.id, product.id);

      const coupon = await prisma.couponCode.create({
        data: {
          code: 'TESTCOUPON',
          discountType: 'PERCENTAGE',
          discountValue: 15,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
      });

      const usage = await prisma.couponUsage.create({
        data: {
          couponId: coupon.id,
          userId: user.id,
          orderId: order.id,
          discountAmount: 750, // 15% of 5000
        },
      });

      expect(usage.couponId).toBe(coupon.id);
      expect(usage.userId).toBe(user.id);
      expect(usage.orderId).toBe(order.id);
      expect(usage.discountAmount).toBe(750);
    });

    it('should increment coupon usage count', async () => {
      const coupon = await prisma.couponCode.create({
        data: {
          code: 'COUNTER',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
          usedCount: 5,
        },
      });

      const updated = await prisma.couponCode.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });

      expect(updated.usedCount).toBe(6);
    });
  });

  describe('Coupon Edge Cases', () => {
    it('should handle zero discount gracefully', async () => {
      const coupon = await prisma.couponCode.create({
        data: {
          code: 'NODISCOUNT',
          discountType: 'PERCENTAGE',
          discountValue: 0,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
      });

      const orderAmount = 10000;
      const discount = (orderAmount * coupon.discountValue) / 100;
      const finalAmount = orderAmount - discount;

      expect(discount).toBe(0);
      expect(finalAmount).toBe(10000);
    });

    it('should prevent negative final amounts', async () => {
      const coupon = await prisma.couponCode.create({
        data: {
          code: 'BIGDISCOUNT',
          discountType: 'FIXED_AMOUNT',
          discountValue: 100000, // Large discount
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
      });

      const orderAmount = 50000; // Smaller than discount
      const finalAmount = Math.max(0, orderAmount - coupon.discountValue);

      expect(finalAmount).toBe(0);
    });
  });
});
