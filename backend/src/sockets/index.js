import OrderSocket from './orderSocket.js';
import ReservationSocket from './reservationSocket.js';
import NotificationSocket from './notificationSocket.js';

class SocketManager {
  constructor(io) {
    this.io = io;
    this.orderSocket = new OrderSocket(io);
    this.reservationSocket = new ReservationSocket(io);
    this.notificationSocket = new NotificationSocket(io);
    this.setupGeneralHandlers();
  }

  setupGeneralHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 New connection handled by SocketManager: ${socket.id}`);

      // General connection handling
      socket.on('error', (error) => {
        console.error('Socket error:', error);
        socket.emit('error', { message: 'An error occurred' });
      });

      socket.on('disconnect', (reason) => {
        console.log(`❌ Disconnection handled by SocketManager: ${socket.id} - Reason: ${reason}`);
      });
    });
  }

  // Public methods for server-side notifications
  sendOrderNotification(userId, notification) {
    return this.notificationSocket.emitOrderNotification(userId, notification);
  }

  sendReservationNotification(userId, notification) {
    return this.notificationSocket.emitReservationNotification(userId, notification);
  }

  sendPaymentNotification(userId, notification) {
    return this.notificationSocket.emitPaymentNotification(userId, notification);
  }

  sendPromotionalNotification(targetUsers, notification) {
    return this.notificationSocket.emitPromotionalNotification(targetUsers, notification);
  }

  sendSystemNotification(notification) {
    return this.notificationSocket.emitSystemNotification(notification);
  }

  sendVendorNotification(vendorId, notification) {
    return this.notificationSocket.emitVendorNotification(vendorId, notification);
  }

  sendAdminNotification(notification) {
    return this.notificationSocket.emitAdminNotification(notification);
  }

  // Direct messaging
  sendDirectNotification(userId, notification) {
    return this.notificationSocket.sendDirectNotification(userId, notification);
  }

  // Analytics
  getNotificationStats() {
    return {
      connectedUsers: this.notificationSocket.getConnectedUsersCount(),
      connectedUserList: this.notificationSocket.getConnectedUsers()
    };
  }
}

export default SocketManager;
