import { prisma } from '../models/index.js';

class OrderSocket {
  constructor(io) {
    this.io = io;
    this.setupOrderEventHandlers();
  }

  setupOrderEventHandlers() {
    this.io.on('connection', (socket) => {
      // Join user, vendor, order rooms ...
      socket.on('joinUserRoom', (userId) => {
        socket.join(`user_${userId}`);
      });

      socket.on('joinVendorRoom', (vendorId) => {
        socket.join(`vendor_${vendorId}`);
      });

      socket.on('joinOrderRoom', (orderId) => {
        socket.join(`order_${orderId}`);
      });

      socket.on('leaveOrderRoom', (orderId) => {
        socket.leave(`order_${orderId}`);
      });

      // Handle order status updates from vendors
      socket.on('updateOrderStatus', async (data) => {
        try {
          const { orderId, status, estimatedTime, vendorId } = data;

          const order = await prisma.order.findFirst({
            where: { id: parseInt(orderId), MenuItem: { vendorid: parseInt(vendorId) } },
            include: { MenuItem: true }
          });

          if (!order) {
            socket.emit('error', { message: 'Order not found or unauthorized' });
            return;
          }

          // Update order status
          await prisma.order.update({
            where: { id: parseInt(orderId) },
            data: { status }
          });

          this.io.to(`order_${orderId}`).emit('orderStatusUpdate', {
            orderId,
            status,
            estimatedTime,
            timestamp: new Date()
          });

          this.io.to(`user_${order.userid}`).emit('orderNotification', {
            type: 'status_update',
            orderId,
            status,
            message: `Your order #${orderId} is now ${status}`,
            timestamp: new Date()
          });

          this.io.to(`vendor_${vendorId}`).emit('orderStatusUpdated', {
            orderId,
            status,
            estimatedTime
          });

        } catch (error) {
          console.error('Update order status error:', error);
          socket.emit('error', { message: 'Failed to update order status' });
        }
      });
      
      socket.on('newOrderCreated', async (orderData) => {
        try {
          const { orderId, userId, vendorId } = orderData;
          const order = await prisma.order.findUnique({
            where: { id: parseInt(orderId) },
            include: { MenuItem: true, User: { select: { id: true, fullName: true, phone: true } } }
          });

          if (order) {
            this.io.to(`vendor_${vendorId}`).emit('newOrder', order);
            this.io.to(`user_${userId}`).emit('orderCreated', {
              orderId,
              message: 'Your order has been placed successfully!'
            });
          }
        } catch (error) {
          console.error('New order notification error:', error);
        }
      });
    });
  }
}

export default OrderSocket;
