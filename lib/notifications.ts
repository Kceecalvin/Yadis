/**
 * Notification Service
 * Handles SMS/Email notifications for order updates
 */

import { prisma } from './db';

interface NotificationPayload {
  userId: string;
  type: 'ORDER_CONFIRMED' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'PROMO' | 'REVIEW_APPROVED';
  title: string;
  message: string;
  orderId?: string;
  sentVia?: 'EMAIL' | 'SMS' | 'IN_APP';
  metadata?: Record<string, any>;
}

/**
 * Create and queue a notification
 */
export async function createNotification(payload: NotificationPayload) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        orderId: payload.orderId,
        sentVia: payload.sentVia || 'EMAIL',
        status: 'PENDING',
        metadata: payload.metadata || {},
      },
    });

    // Queue for sending
    await queueNotificationSend(notification.id);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Queue notification for async sending
 */
async function queueNotificationSend(notificationId: string) {
  // In production, this would queue to a job processor (Bull, RabbitMQ, etc)
  // For now, we'll call the send function directly with a small delay
  setTimeout(() => sendNotification(notificationId), 100);
}

/**
 * Send notification via email/SMS
 */
export async function sendNotification(notificationId: string) {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: { user: true },
    });

    if (!notification) {
      console.error(`Notification ${notificationId} not found`);
      return;
    }

    if (notification.status !== 'PENDING') {
      return;
    }

    let sent = false;

    // Send via email
    if (notification.sentVia === 'EMAIL' || notification.sentVia === 'IN_APP') {
      sent = await sendEmailNotification(notification);
    }

    // Send via SMS
    if (notification.sentVia === 'SMS') {
      sent = await sendSMSNotification(notification);
    }

    // Update notification status
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: sent ? 'SENT' : 'FAILED',
        sentAt: sent ? new Date() : null,
      },
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'FAILED' },
    });
  }
}

/**
 * Send email notification
 * In production, integrate with SendGrid, AWS SES, etc.
 */
async function sendEmailNotification(notification: any): Promise<boolean> {
  try {
    if (!notification.user?.email) {
      console.warn('User email not found for notification:', notification.id);
      return false;
    }

    // TODO: Integrate with email service (SendGrid, AWS SES)
    console.log(`📧 Sending email to ${notification.user.email}:`);
    console.log(`   Subject: ${notification.title}`);
    console.log(`   Message: ${notification.message}`);

    // Simulate email sending
    // In production:
    // const response = await sendgrid.send({
    //   to: notification.user.email,
    //   from: 'noreply@yadplast.com',
    //   subject: notification.title,
    //   html: generateEmailTemplate(notification),
    // });

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send SMS notification
 * In production, integrate with Twilio, Africa's Talking, etc.
 */
async function sendSMSNotification(notification: any): Promise<boolean> {
  try {
    if (!notification.user?.phone) {
      console.warn('User phone not found for notification:', notification.id);
      return false;
    }

    // TODO: Integrate with SMS service (Twilio, Africa's Talking)
    console.log(`📱 Sending SMS to ${notification.user.phone}:`);
    console.log(`   Message: ${notification.message}`);

    // Simulate SMS sending
    // In production:
    // const response = await twilio.messages.create({
    //   body: notification.message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: notification.user.phone,
    // });

    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}

/**
 * Get user notifications
 */
export async function getUserNotifications(
  userId: string,
  limit: number = 20,
  offset: number = 0
) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

/**
 * Send order update notifications
 */
export async function notifyOrderStatusUpdate(
  orderId: string,
  status: string,
  userId: string
) {
  const statusMessages: Record<string, { title: string; message: string }> = {
    CONFIRMED: {
      title: '✅ Order Confirmed',
      message: 'Your order has been confirmed and is being prepared for shipment.',
    },
    SHIPPED: {
      title: '📦 Order Shipped',
      message: 'Your order is on its way! Track your package with the tracking number in your email.',
    },
    DELIVERED: {
      title: '🎉 Order Delivered',
      message: 'Your order has been delivered. Thank you for shopping with Yadplast!',
    },
    CANCELLED: {
      title: '❌ Order Cancelled',
      message: 'Your order has been cancelled. A refund will be processed shortly.',
    },
  };

  const statusInfo = statusMessages[status] || {
    title: 'Order Update',
    message: `Your order status has been updated to: ${status}`,
  };

  return createNotification({
    userId,
    type: 'ORDER_CONFIRMED',
    title: statusInfo.title,
    message: statusInfo.message,
    orderId,
    sentVia: 'EMAIL',
  });
}

/**
 * Send promotional notifications
 */
export async function sendPromoNotification(
  userId: string,
  title: string,
  message: string,
  metadata?: any
) {
  return createNotification({
    userId,
    type: 'PROMO',
    title,
    message,
    sentVia: 'EMAIL',
    metadata,
  });
}

/**
 * Notify when review is approved
 */
export async function notifyReviewApproved(
  userId: string,
  productName: string
) {
  return createNotification({
    userId,
    type: 'REVIEW_APPROVED',
    title: '⭐ Your Review is Live',
    message: `Your review for "${productName}" has been approved and is now visible to other customers.`,
    sentVia: 'EMAIL',
  });
}

export default {
  createNotification,
  sendNotification,
  getUserNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount,
  notifyOrderStatusUpdate,
  sendPromoNotification,
  notifyReviewApproved,
};
