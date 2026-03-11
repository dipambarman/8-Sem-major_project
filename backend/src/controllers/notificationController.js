import { prisma } from '../models/index.js';

// Get user notifications
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Also get unread count
    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications'
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const notification = await prisma.notification.updateMany({
      where: {
        id: parseInt(notificationId),
        userId
      },
      data: { isRead: true }
    });

    if (notification.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read'
    });
  }
};

// Admin: Broadcast
export const broadcastNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    
    // Get all user ids
    const users = await prisma.user.findMany({ select: { id: true } });
    
    // Create notifications for all users
    const notifications = users.map(user => ({
      userId: user.id,
      title,
      message,
      type: type || 'alert'
    }));

    await prisma.notification.createMany({
      data: notifications
    });

    res.json({
      success: true,
      message: 'Notification broadcasted successfully'
    });
  } catch (error) {
    console.error('Broadcast notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to broadcast notification'
    });
  }
};
