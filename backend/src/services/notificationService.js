import prisma from '../utils/database.js';
import logger from '../utils/logger.js';

/**
 * NotificationService — Prisma-backed notification CRUD.
 * Used by controllers and sockets for persistent notification management.
 */
class NotificationService {
  /**
   * Create a notification for a specific user.
   */
  async createNotification(userId, { title, message, type = 'general' }) {
    try {
      const notification = await prisma.notification.create({
        data: { userId, title, message, type },
      });
      logger.info('NotificationService', `Created notification for user ${userId}: ${title}`);
      return notification;
    } catch (error) {
      logger.error('NotificationService', 'Failed to create notification', error);
      throw error;
    }
  }

  /**
   * Create notifications for multiple users (broadcast).
   */
  async broadcastNotification({ title, message, type = 'alert' }, userIds = null) {
    try {
      let targetIds = userIds;
      if (!targetIds) {
        const users = await prisma.user.findMany({ select: { id: true } });
        targetIds = users.map((u) => u.id);
      }

      const data = targetIds.map((userId) => ({
        userId,
        title,
        message,
        type,
      }));

      const result = await prisma.notification.createMany({ data });
      logger.info('NotificationService', `Broadcast notification to ${result.count} users`);
      return result;
    } catch (error) {
      logger.error('NotificationService', 'Failed to broadcast notification', error);
      throw error;
    }
  }

  /**
   * Get unread notifications for a user.
   */
  async getUnreadNotifications(userId) {
    return prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get notification count for a user.
   */
  async getUnreadCount(userId) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * Get paginated notifications for a user.
   */
  async getUserNotifications(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    return {
      notifications,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Mark a single notification as read.
   */
  async markAsRead(notificationId, userId) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  /**
   * Mark all notifications as read for a user.
   */
  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

export default new NotificationService();
