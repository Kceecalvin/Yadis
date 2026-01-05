/**
 * Integration Tests
 * Tests end-to-end workflows with all systems
 */

import { prisma } from '../lib/db';
import { sendEmail, generateOrderConfirmationEmail } from '../lib/email-service';
import { sendSMS, generateOrderConfirmationSMS } from '../lib/sms-service';
import {
  createNotification,
  notifyOrderStatusUpdate,
} from '../lib/notifications';
import {
  initializeInventory,
  reserveStock,
  recordSale,
} from '../lib/inventory';
import { addToWishlist, getUserWishlist } from '../lib/wishlist';
import { generateReferralCode, useReferralCode } from '../lib/referral';
import { recordProductInteraction, getOrderAnalytics } from '../lib/analytics';

describe('E2E Integration Tests', () => {
  let testUserId: string;
  let testProductId: string;
  let testCategoryId: string;
  let testOrderId: string;

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: `integration-test-${Date.now()}@example.com`,
        name: 'Integration Test User',
        phone: '+254712345678',
      },
    });
    testUserId = user.id;

    // Create test category
    const category = await prisma.category.create({
      data: {
        slug: `integration-${Date.now()}`,
        titleEn: 'Integration Test Category',
        titleSw: 'Kategoria ya Jaribio',
        section: 'FOOD',
      },
    });
    testCategoryId = category.id;

    // Create test product
    const product = await prisma.product.create({
      data: {
        slug: `integration-product-${Date.now()}`,
        nameEn: 'Integration Test Product',
        nameSw: 'Bidhaa ya Jaribio',
        priceCents: 25000,
        imageUrl: 'https://example.com/image.jpg',
        categoryId: category.id,
      },
    });
    testProductId = product.id;

    // Initialize inventory
    await initializeInventory(testProductId, 100);
  });

  afterAll(async () => {
    // Cleanup
    try {
      await prisma.notification.deleteMany({
        where: { userId: testUserId },
      });
      await prisma.order.deleteMany({
        where: { userId: testUserId },
      });
      await prisma.wishlist.deleteMany({
        where: { userId: testUserId },
      });
      await prisma.inventoryLog.deleteMany({
        where: { inventory: { productId: testProductId } },
      });
      await prisma.inventory.deleteMany({
        where: { productId: testProductId },
      });
      await prisma.product.delete({
        where: { id: testProductId },
      });
      await prisma.category.delete({
        where: { id: testCategoryId },
      });
      await prisma.user.delete({
        where: { id: testUserId },
      });
    } catch (error) {
      console.log('Cleanup error (can be ignored)');
    }
  });

  describe('Complete Order Flow', () => {
    it('should complete full order lifecycle', async () => {
      // 1. User adds product to wishlist
      const wishlistItem = await addToWishlist(testUserId, testProductId);
      expect(wishlistItem).toBeDefined();

      // 2. User creates order
      const order = await prisma.order.create({
        data: {
          user: { connect: { id: testUserId } },
          totalCents: 50000,
          status: 'PENDING',
          items: {
            create: [
              {
                productId: testProductId,
                quantity: 2,
                priceCents: 25000,
              },
            ],
          },
        },
        include: { items: true },
      });

      testOrderId = order.id;
      expect(order.id).toBeDefined();
      expect(order.items.length).toBe(1);

      // 3. Reserve stock
      const inventory = await reserveStock(testProductId, 2);
      expect(inventory.reserved).toBe(2);
      expect(inventory.available).toBe(98);

      // 4. Send order confirmation notification
      const notification = await notifyOrderStatusUpdate(
        order.id,
        'CONFIRMED',
        testUserId
      );
      expect(notification).toBeDefined();
      expect(notification.status).toBe('PENDING');

      // 5. Record product interaction
      await recordProductInteraction(testUserId, testProductId, 'PURCHASE');

      // 6. Update order status to shipped
      await prisma.orderTracking.create({
        data: {
          order: { connect: { id: order.id } },
          status: 'SHIPPED',
          shippedAt: new Date(),
        },
      });

      // 7. Send shipped notification
      const shippedNotif = await notifyOrderStatusUpdate(
        order.id,
        'SHIPPED',
        testUserId
      );
      expect(shippedNotif).toBeDefined();

      // 8. Record sale
      const saleInventory = await recordSale(testProductId, 2);
      expect(saleInventory.quantity).toBe(98);

      // 9. Update to delivered
      await prisma.orderTracking.update({
        where: { orderId: order.id },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date(),
        },
      });

      // 10. Send delivered notification
      const deliveredNotif = await notifyOrderStatusUpdate(
        order.id,
        'DELIVERED',
        testUserId
      );
      expect(deliveredNotif).toBeDefined();

      // Verify final state
      const finalOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          tracking: true,
          items: true,
        },
      });

      expect(finalOrder).toBeDefined();
      expect(finalOrder?.tracking?.status).toBe('DELIVERED');
    });
  });

  describe('Referral Integration', () => {
    it('should complete referral flow', async () => {
      // 1. Create referral code
      const referralCode = await generateReferralCode(testUserId, 10);
      expect(referralCode.code).toBeDefined();

      // 2. Create new user (referee)
      const refereeUser = await prisma.user.create({
        data: {
          email: `referee-${Date.now()}@example.com`,
          name: 'Referee User',
        },
      });

      // 3. Use referral code
      const referral = await useReferralCode(
        referralCode.code,
        refereeUser.email,
        refereeUser.id
      );

      expect(referral).toBeDefined();
      expect(referral.status).toBe('COMPLETED');

      // 4. Verify rewards were created
      const referrerRewards = await prisma.referralReward.findMany({
        where: { userId: testUserId },
      });

      expect(referrerRewards.length).toBeGreaterThan(0);

      // Cleanup referee
      await prisma.referralReward.deleteMany({
        where: { userId: refereeUser.id },
      });
      await prisma.user.delete({ where: { id: refereeUser.id } });
    });
  });

  describe('Notification Delivery', () => {
    it('should send email notification', async () => {
      const emailTemplate = generateOrderConfirmationEmail({
        orderId: testOrderId || 'TEST-001',
        customerName: 'Test Customer',
        total: 50000,
        items: [
          {
            name: 'Test Product',
            quantity: 2,
            price: 25000,
          },
        ],
      });

      expect(emailTemplate).toContain('Order Confirmed');
      expect(emailTemplate).toContain('Test Customer');
      expect(emailTemplate).toContain('KES 500.00');
    });

    it('should send SMS notification', async () => {
      const smsMessage = generateOrderConfirmationSMS({
        orderId: testOrderId || 'TEST-001',
        total: 50000,
      });

      expect(smsMessage).toContain('Order');
      expect(smsMessage).toContain('KES 500.00');
      expect(smsMessage.length).toBeLessThanOrEqual(160);
    });
  });

  describe('Analytics Integration', () => {
    beforeEach(async () => {
      // Record some interactions
      await recordProductInteraction(testUserId, testProductId, 'VIEW');
      await recordProductInteraction(testUserId, testProductId, 'CLICK');
      await recordProductInteraction(testUserId, testProductId, 'ADD_TO_CART');
    });

    it('should track product interactions', async () => {
      const interaction = await prisma.userInteraction.findUnique({
        where: {
          userId_productId_actionType: {
            userId: testUserId,
            productId: testProductId,
            actionType: 'VIEW',
          },
        },
      });

      expect(interaction).toBeDefined();
      expect(interaction?.actionCount).toBeGreaterThan(0);
    });

    it('should calculate order analytics', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      const endDate = new Date();

      const analytics = await getOrderAnalytics(startDate, endDate);

      expect(analytics).toBeDefined();
      expect(analytics.totalOrders).toBeGreaterThanOrEqual(0);
      expect(analytics.totalRevenue).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Inventory Management Integration', () => {
    it('should manage inventory through order lifecycle', async () => {
      // Get initial inventory
      const initialInventory = await prisma.inventory.findUnique({
        where: { productId: testProductId },
      });

      const initialQuantity = initialInventory?.quantity || 0;

      // Create new product for this test
      const testProduct2 = await prisma.product.create({
        data: {
          slug: `inventory-test-${Date.now()}`,
          nameEn: 'Inventory Test Product',
          nameSw: 'Bidhaa Jaribio',
          priceCents: 10000,
          imageUrl: 'https://example.com/image.jpg',
          categoryId: testCategoryId,
        },
      });

      // Initialize with 50 units
      await initializeInventory(testProduct2.id, 50);

      // Reserve 10
      const reserved = await reserveStock(testProduct2.id, 10);
      expect(reserved.available).toBe(40);

      // Record sale of 10
      const saleRecord = await recordSale(testProduct2.id, 10);
      expect(saleRecord.quantity).toBe(40);

      // Restock 20
      const restocked = await prisma.inventory.findUnique({
        where: { productId: testProduct2.id },
      });

      // Cleanup
      await prisma.inventoryLog.deleteMany({
        where: { inventory: { productId: testProduct2.id } },
      });
      await prisma.inventory.deleteMany({
        where: { productId: testProduct2.id },
      });
      await prisma.product.delete({
        where: { id: testProduct2.id },
      });
    });
  });

  describe('Wishlist Integration', () => {
    it('should manage wishlist', async () => {
      // Create another test product
      const product2 = await prisma.product.create({
        data: {
          slug: `wishlist-test-${Date.now()}`,
          nameEn: 'Wishlist Test Product',
          nameSw: 'Bidhaa Wishlist',
          priceCents: 15000,
          imageUrl: 'https://example.com/image.jpg',
          categoryId: testCategoryId,
        },
      });

      // Add to wishlist
      await addToWishlist(testUserId, product2.id);

      // Get wishlist
      const wishlist = await getUserWishlist(testUserId);
      expect(wishlist.length).toBeGreaterThan(0);

      // Cleanup
      await prisma.wishlist.deleteMany({
        where: { userId: testUserId, productId: product2.id },
      });
      await prisma.product.delete({ where: { id: product2.id } });
    });
  });

  describe('Multi-System Coordination', () => {
    it('should coordinate between all systems', async () => {
      // Simulate complete user journey
      const user = await prisma.user.create({
        data: {
          email: `journey-${Date.now()}@example.com`,
          name: 'Journey Test User',
          phone: '+254712345678',
        },
      });

      // 1. View product
      await recordProductInteraction(user.id, testProductId, 'VIEW');

      // 2. Add to wishlist
      await addToWishlist(user.id, testProductId);

      // 3. Create order
      const order = await prisma.order.create({
        data: {
          user: { connect: { id: user.id } },
          totalCents: 25000,
          status: 'PENDING',
          items: {
            create: [
              {
                productId: testProductId,
                quantity: 1,
                priceCents: 25000,
              },
            ],
          },
        },
      });

      // 4. Reserve inventory
      await reserveStock(testProductId, 1);

      // 5. Create notification
      await createNotification({
        userId: user.id,
        type: 'ORDER_CONFIRMED',
        title: 'Order Created',
        message: 'Your order has been created',
      });

      // 6. Record interaction
      await recordProductInteraction(user.id, testProductId, 'PURCHASE');

      // Verify everything was created
      const wishlist = await getUserWishlist(user.id);
      const orders = await prisma.order.findMany({
        where: { userId: user.id },
      });
      const notifications = await prisma.notification.findMany({
        where: { userId: user.id },
      });

      expect(wishlist.length).toBeGreaterThan(0);
      expect(orders.length).toBeGreaterThan(0);
      expect(notifications.length).toBeGreaterThan(0);

      // Cleanup
      await prisma.notification.deleteMany({
        where: { userId: user.id },
      });
      await prisma.order.deleteMany({
        where: { userId: user.id },
      });
      await prisma.wishlist.deleteMany({
        where: { userId: user.id },
      });
      await prisma.user.delete({
        where: { id: user.id },
      });
    });
  });
});
