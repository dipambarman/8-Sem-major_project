import prisma from '../utils/database.js';
import notificationService from '../services/notificationService.js';

class NotificationSocket {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map(); // Track user socket connections
    this.setupNotificationHandlers();
  }

  setupNotificationHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Notification socket connected: ${socket.id}`);

      // User authentication and room joining
      socket.on('authenticateUser', async (data) => {
        try {
          const { userId, userType, token } = data;
          
          if (userId && token) {
            socket.userId = userId;
            socket.userType = userType;
            
            socket.join(`user_${userId}`);
            socket.join(`${userType}_notifications`);
            
            this.userSockets.set(userId, socket);
            
            console.log(`👤 User ${userId} authenticated and joined notification rooms`);
            
            // Send pending notifications to user
            await this.sendPendingNotifications(userId);
            
            socket.emit('notificationAuth', {
              success: true,
              message: 'Notification system connected'
            });
          }
        } catch (error) {
          console.error('Authentication error:', error);
          socket.emit('notificationAuth', {
            success: false,
            error: 'Authentication failed'
          });
        }
      });

      // Mark notification as read
      socket.on('markNotificationRead', async (data) => {
        try {
          const { notificationId } = data;
          await notificationService.markAsRead(parseInt(notificationId), socket.userId);
          
          socket.emit('notificationMarkedRead', {
            notificationId,
            success: true
          });
        } catch (error) {
          console.error('Mark notification read error:', error);
        }
      });

      // Get notification history
      socket.on('getNotificationHistory', async (data) => {
        try {
          const { page = 1, limit = 20 } = data;
          const result = await notificationService.getUserNotifications(
            socket.userId, 
            page, 
            limit
          );
          
          socket.emit('notificationHistory', {
            ...result,
            success: true
          });
        } catch (error) {
          console.error('Get notification history error:', error);
        }
      });

      // Join vendor notification room
      socket.on('joinVendorNotifications', (vendorId) => {
        if (socket.userType === 'vendor' && vendorId) {
          socket.join(`vendor_${vendorId}`);
          console.log(`🏪 Vendor ${vendorId} joined vendor notifications`);
        }
      });

      // Join admin notification room
      socket.on('joinAdminNotifications', () => {
        if (socket.userType === 'admin') {
          socket.join('admin_notifications');
          console.log(`👨‍💼 Admin joined admin notifications`);
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
          console.log(`❌ User ${socket.userId} notification socket disconnected`);
        }
      });
    });
  }

  // Send pending notifications when user connects
  async sendPendingNotifications(userId) {
    try {
      const pendingNotifications = await notificationService.getUnreadNotifications(userId);
      
      if (pendingNotifications.length > 0) {
        this.io.to(`user_${userId}`).emit('pendingNotifications', {
          notifications: pendingNotifications,
          count: pendingNotifications.length
        });
      }
    } catch (error) {
      console.error('Send pending notifications error:', error);
    }
  }

  // Order-related notifications
  emitOrderNotification(userId, notification) {
    const orderNotification = {
      id: `order_${Date.now()}`,
      type: 'order',
      title: this.getOrderNotificationTitle(notification.status),
      message: notification.message,
      data: {
        orderId: notification.orderId,
        orderNumber: notification.orderNumber,
        status: notification.status,
        estimatedTime: notification.estimatedTime
      },
      timestamp: new Date(),
      isRead: false,
      priority: this.getNotificationPriority(notification.status)
    };

    this.io.to(`user_${userId}`).emit('notification', orderNotification);
    
    // Persist to database
    notificationService.createNotification(userId, {
      title: orderNotification.title,
      message: notification.message,
      type: 'order',
    }).catch(err => console.error('Failed to persist order notification:', err));
    
    console.log(`📦 Order notification sent to user ${userId}:`, orderNotification.title);
  }

  // Reservation-related notifications
  emitReservationNotification(userId, notification) {
    const reservationNotification = {
      id: `reservation_${Date.now()}`,
      type: 'reservation',
      title: this.getReservationNotificationTitle(notification.status),
      message: notification.message,
      data: {
        reservationId: notification.reservationId,
        status: notification.status,
        reservationTime: notification.reservationTime,
        tableNumber: notification.tableNumber
      },
      timestamp: new Date(),
      isRead: false,
      priority: this.getNotificationPriority(notification.status)
    };

    this.io.to(`user_${userId}`).emit('notification', reservationNotification);
    
    notificationService.createNotification(userId, {
      title: reservationNotification.title,
      message: notification.message,
      type: 'reservation',
    }).catch(err => console.error('Failed to persist reservation notification:', err));
    
    console.log(`🍽️ Reservation notification sent to user ${userId}:`, reservationNotification.title);
  }

  // Payment-related notifications
  emitPaymentNotification(userId, notification) {
    const paymentNotification = {
      id: `payment_${Date.now()}`,
      type: 'payment',
      title: this.getPaymentNotificationTitle(notification.status),
      message: notification.message,
      data: {
        paymentId: notification.paymentId,
        amount: notification.amount,
        status: notification.status,
        paymentMethod: notification.paymentMethod
      },
      timestamp: new Date(),
      isRead: false,
      priority: notification.status === 'failed' ? 'high' : 'medium'
    };

    this.io.to(`user_${userId}`).emit('notification', paymentNotification);
    
    notificationService.createNotification(userId, {
      title: paymentNotification.title,
      message: notification.message,
      type: 'payment',
    }).catch(err => console.error('Failed to persist payment notification:', err));
    
    console.log(`💳 Payment notification sent to user ${userId}:`, paymentNotification.title);
  }

  // Promotional/marketing notifications
  emitPromotionalNotification(targetUsers, notification) {
    const promoNotification = {
      id: `promo_${Date.now()}`,
      type: 'promotional',
      title: notification.title,
      message: notification.message,
      data: {
        promoCode: notification.promoCode,
        discount: notification.discount,
        validUntil: notification.validUntil,
        imageUrl: notification.imageUrl
      },
      timestamp: new Date(),
      isRead: false,
      priority: 'low'
    };

    if (targetUsers === 'all') {
      this.io.to('user_notifications').emit('notification', promoNotification);
      console.log('📢 Promotional notification broadcast to all users');
    } else if (Array.isArray(targetUsers)) {
      targetUsers.forEach(userId => {
        this.io.to(`user_${userId}`).emit('notification', promoNotification);
      });
      console.log(`📢 Promotional notification sent to ${targetUsers.length} users`);
    }
  }

  // System notifications (maintenance, updates, etc.)
  emitSystemNotification(notification) {
    const systemNotification = {
      id: `system_${Date.now()}`,
      type: 'system',
      title: notification.title,
      message: notification.message,
      data: {
        maintenanceTime: notification.maintenanceTime,
        severity: notification.severity
      },
      timestamp: new Date(),
      isRead: false,
      priority: notification.severity === 'critical' ? 'high' : 'medium'
    };

    this.io.emit('notification', systemNotification);
    console.log('⚠️ System notification broadcast:', systemNotification.title);
  }

  // Vendor notifications
  emitVendorNotification(vendorId, notification) {
    const vendorNotification = {
      id: `vendor_${Date.now()}`,
      type: 'vendor',
      title: notification.title,
      message: notification.message,
      data: notification.data,
      timestamp: new Date(),
      isRead: false,
      priority: notification.priority || 'medium'
    };

    this.io.to(`vendor_${vendorId}`).emit('notification', vendorNotification);
    console.log(`🏪 Vendor notification sent to vendor ${vendorId}:`, vendorNotification.title);
  }

  // Admin notifications
  emitAdminNotification(notification) {
    const adminNotification = {
      id: `admin_${Date.now()}`,
      type: 'admin',
      title: notification.title,
      message: notification.message,
      data: notification.data,
      timestamp: new Date(),
      isRead: false,
      priority: notification.priority || 'medium'
    };

    this.io.to('admin_notifications').emit('notification', adminNotification);
    console.log('👨‍💼 Admin notification sent:', adminNotification.title);
  }

  // Helper methods for notification titles
  getOrderNotificationTitle(status) {
    const titles = {
      confirmed: 'Order Confirmed! 🎉',
      preparing: 'Your order is being prepared 👨‍🍳',
      ready: 'Order Ready for Pickup! 🛍️',
      completed: 'Order Completed ✅',
      cancelled: 'Order Cancelled ❌'
    };
    return titles[status] || 'Order Update';
  }

  getReservationNotificationTitle(status) {
    const titles = {
      confirmed: 'Reservation Confirmed! 🎉',
      cancelled: 'Reservation Cancelled ❌',
      completed: 'Thank you for visiting! ✅',
      reminder: 'Reservation Reminder ⏰'
    };
    return titles[status] || 'Reservation Update';
  }

  getPaymentNotificationTitle(status) {
    const titles = {
      completed: 'Payment Successful! ✅',
      failed: 'Payment Failed ❌',
      refunded: 'Refund Processed 💰'
    };
    return titles[status] || 'Payment Update';
  }

  getNotificationPriority(status) {
    const highPriorityStatuses = ['failed', 'cancelled', 'ready'];
    const mediumPriorityStatuses = ['confirmed', 'preparing', 'completed'];
    
    if (highPriorityStatuses.includes(status)) return 'high';
    if (mediumPriorityStatuses.includes(status)) return 'medium';
    return 'low';
  }

  // Direct user messaging
  sendDirectNotification(userId, notification) {
    const userSocket = this.userSockets.get(userId);
    if (userSocket && userSocket.connected) {
      userSocket.emit('notification', notification);
      console.log(`📨 Direct notification sent to user ${userId}`);
      return true;
    } else {
      notificationService.createNotification(userId, {
        title: notification.title || 'Notification',
        message: notification.message || '',
        type: notification.type || 'general',
      }).catch(err => console.error('Failed to persist offline notification:', err));
      console.log(`📪 User ${userId} offline, notification saved for later`);
      return false;
    }
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.userSockets.size;
  }

  // Get all connected users
  getConnectedUsers() {
    return Array.from(this.userSockets.keys());
  }
}

export default NotificationSocket;
