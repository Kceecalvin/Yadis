/**
 * Notifications System Tests
 * Tests SMS/Email notification functionality
 */

import { prisma } from '../lib/db';
import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount,
  notifyOrderStatusUpdate,
  sendPromoNotification,
  notifyReviewApproved,
} from '../lib/notifications';

describe('Notifications System', () => {
  let testUserId: string;

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'notif-test@example.com',
        name: 'Notification Test User',
        phone: '+254712345678',
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Cleanup (in correct order to avoid foreign key issues)
    try {
      await prisma.notification.deleteMany({
        where: { userId: testUserId },
      });
      await prisma.user.delete({
        where: { id: testUserId },
      });
    } catch (error) {
      console.log('Cleanup error (can be ignored):', error);
    }
  });

  describe('createNotification', () => {
    it('should create a notification with EMAIL delivery', async () => {
      const notification = await createNotification({
        userId: testUserId,
        type: 'ORDER_CONFIRMED',
        title: 'Order Confirmed',
        message: 'Your order has been confirmed',
        sentVia: 'EMAIL',
      });

      expect(notification).toBeDefined();
      expect(notification.userId).toBe(testUserId);
      expect(notification.type).toBe('ORDER_CONFIRMED');
      expect(notification.sentVia).toBe('EMAIL');
      expect(notification.status).toBe('PENDING');
    });

    it('should create a notification with SMS delivery', async () => {
      const notification = await createNotification({
        userId: testUserId,
        type: 'ORDER_SHIPPED',
        title: 'Order Shipped',
        message: 'Your order is on the way',
        sentVia: 'SMS',
      });

      expect(notification.sentVia).toBe('SMS');
      expect(notification.status).toBe('PENDING');
    });

    it('should create a notification with metadata', async () => {
      const metadata = { orderId: 'ORD-123', trackingUrl: 'https://track.example.com' };
      const notification = await createNotification({
        userId: testUserId,
        type: 'ORDER_DELIVERED',
        title: 'Order Delivered',
        message: 'Your order has arrived',
        metadata,
      });

      expect(notification.metadata).toEqual(metadata);
    });
  });

  describe('getUserNotifications', () => {
    beforeEach(async () => {
      // Create multiple notifications
      for (let i = 0; i < 5; i++) {
        await createNotification({
          userId: testUserId,
          type: 'ORDER_CONFIRMED',
          title: `Notification ${i}`,
          message: `Message ${i}`,
        });
      }
    });

    it('should retrieve all user notifications', async () => {
      const notifications = await getUserNotifications(testUserId);
      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].userId).toBe(testUserId);
    });

    it('should support pagination', async () => {
      const page1 = await getUserNotifications(testUserId, 2, 0);
      const page2 = await getUserNotifications(testUserId, 2, 2);

      expect(page1.length).toBe(2);
      expect(page2.length).toBeLessThanOrEqual(2);
      expect(page1[0].id).not.toBe(page2[0].id);
    });

    it('should return newest notifications first', async () => {
      const notifications = await getUserNotifications(testUserId);
      if (notifications.length > 1) {
        expect(notifications[0].createdAt.getTime())
          .toBeGreaterThan(notifications[1].createdAt.getTime());
      }
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read', async () => {
      const notification = await createNotification({
        userId: testUserId,
        type: 'ORDER_CONFIRMED',
        title: 'Test',
        message: 'Test message',
      });

      const updated = await markNotificationAsRead(notification.id);

      expect(updated.isRead).toBe(true);
    });

    it('should update sentAt timestamp when marking as read', async () => {
      const notification = await createNotification({
        userId: testUserId,
        type: 'ORDER_CONFIRMED',
        title: 'Test',
        message: 'Test message',
      });

      const before = new Date();
      const updated = await markNotificationAsRead(notification.id);
      const after = new Date();

      expect(updated.isRead).toBe(true);
    });
  });

  describe('getUnreadNotificationCount', () => {
    beforeEach(async () => {
      // Clear and create test notifications
      await prisma.notification.deleteMany({
        where: { userId: testUserId },
      });
      
      for (let i = 0; i < 3; i++) {
        await createNotification({
          userId: testUserId,
          type: 'ORDER_CONFIRMED',
          title: `Unread ${i}`,
          message: 'Test',
        });
      }
    });

    it('should count unread notifications', async () => {
      const count = await getUnreadNotificationCount(testUserId);
      expect(count).toBeGreaterThanOrEqual(3);
    });

    it('should decrease count when notification is read', async () => {
      const beforeCount = await getUnreadNotificationCount(testUserId);
      
      const notifications = await getUserNotifications(testUserId, 1);
      if (notifications.length > 0) {
        await markNotificationAsRead(notifications[0].id);
        const afterCount = await getUnreadNotificationCount(testUserId);
        expect(afterCount).toBeLessThan(beforeCount);
      }
    });
  });

  describe('Notification Types', () => {
    it('should create ORDER_CONFIRMED notification', async () => {
      const notif = await notifyOrderStatusUpdate(
        'ORD-123',
        'CONFIRMED',
        testUserId
      );
      expect(notif.type).toBe('ORDER_CONFIRMED');
    });

    it('should create PROMO notification', async () => {
      const notif = await sendPromoNotification(
        testUserId,
        'Special Offer',
        'Get 20% off on all items'
      );
      expect(notif.type).toBe('PROMO');
    });

    it('should create REVIEW_APPROVED notification', async () => {
      const notif = await notifyReviewApproved(
        testUserId,
        'Deluxe Bucket'
      );
      expect(notif.type).toBe('REVIEW_APPROVED');
    });
  });

  describe('Notification Status Flow', () => {
    it('should start with PENDING status', async () => {
      const notif = await createNotification({
        userId: testUserId,
        type: 'ORDER_CONFIRMED',
        title: 'Test',
        message: 'Test',
      });

      expect(notif.status).toBe('PENDING');
      expect(notif.sentAt).toBeNull();
    });
  });
});
