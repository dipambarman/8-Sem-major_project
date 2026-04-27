import prisma from '../utils/database.js';
import qrCodeService from '../services/qrCodeService.js';
import orderService from '../services/orderService.js';
import { parsePagination, buildPaginationMeta } from '../utils/helpers.js';

class OrderController {
  // Create order — delegates to orderService for SmartPass discount + wallet payment
  async createOrder(req, res) {
    try {
      const { items, orderType, paymentMethod, slotTime, specialInstructions } = req.body;
      const userId = req.user.id;

      const order = await orderService.createOrder(userId, {
        items,
        orderType,
        paymentMethod,
        slotTime,
        specialInstructions,
      });

      res.status(201).json({
        success: true,
        data: order,
        message: 'Order created successfully'
      });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ success: false, error: error.message });
      }
      console.error('Create order error:', error);
      res.status(500).json({ success: false, error: 'Failed to create order' });
    }
  }

  // Get user orders
  async getUserOrders(req, res) {
    try {
      const userId = req.user.id;
      const { page, limit, skip } = parsePagination(req.query, { limit: 10 });

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: { userId },
          include: {
            items: { include: { menuItem: true } },
            vendor: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.order.count({ where: { userId } })
      ]);

      res.json({
        success: true,
        data: {
          orders,
          pagination: buildPaginationMeta(total, page, limit)
        }
      });
    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch orders' });
    }
  }

  // Get vendor orders
  async getVendorOrders(req, res) {
    try {
      const vendorId = req.vendor.id;
      const { status } = req.query;
      const { page, limit, skip } = parsePagination(req.query);

      const where = { vendorId };
      if (status) where.status = status;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            items: { include: { menuItem: true } },
            user: { select: { id: true, fullName: true, phone: true } }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.order.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          orders,
          pagination: buildPaginationMeta(total, page, limit)
        }
      });
    } catch (error) {
      console.error('Get vendor orders error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch vendor orders' });
    }
  }

  // Get order details
  async getOrderDetails(req, res) {
    try {
      const { orderId } = req.params;
      
      const order = await prisma.order.findUnique({
        where: { id: parseInt(orderId) },
        include: {
          items: { include: { menuItem: true } },
          user: { select: { id: true, fullName: true, phone: true, email: true } },
          payments: true
        }
      });

      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      // If requested by a vendor, ensure this order belongs to them
      if (req.vendor) {
        const belongsToVendor = order.items.some(item => item.menuItem.vendorId === req.vendor.id);
        if (!belongsToVendor) {
          return res.status(403).json({ success: false, error: 'Access denied' });
        }
      }

      res.json({ success: true, data: order });
    } catch (error) {
      console.error('Get order details error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch order details' });
    }
  }

  // Update order status
  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status, estimatedTime } = req.body;

      const order = await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: {
          status,
          estimatedTime: estimatedTime || undefined
        }
      });

      res.json({
        success: true,
        data: order,
        message: 'Order status updated successfully'
      });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ success: false, error: 'Failed to update order status' });
    }
  }

  // Validate QR code for order pickup/delivery
  async validateQRCode(req, res) {
    try {
      const { qrData } = req.body;

      const validation = qrCodeService.validateQRData(qrData);

      if (!validation.valid) {
        return res.status(400).json({ success: false, error: validation.error });
      }

      const { data } = validation;

      if (data.type === 'order') {
        const order = await prisma.order.findUnique({
          where: { orderNumber: data.orderNumber },
          include: {
            items: { include: { menuItem: true } },
            user: { select: { id: true, fullName: true, email: true } },
            vendor: { select: { id: true, name: true } }
          }
        });

        if (!order) {
          return res.status(404).json({ success: false, error: 'Order not found' });
        }

        if (order.status !== 'READY' && order.status !== 'PREPARING') {
          return res.status(400).json({ success: false, error: 'Order is not ready for pickup/delivery' });
        }

        res.json({
          success: true,
          data: { order, qrValid: true },
          message: 'QR code validated successfully'
        });
      } else {
        res.status(400).json({ success: false, error: 'Invalid QR code type' });
      }
    } catch (error) {
      console.error('QR validation error:', error);
      res.status(500).json({ success: false, error: 'Failed to validate QR code' });
    }
  }

  // Get order QR code
  async getOrderQRCode(req, res) {
    try {
      const { orderId } = req.params;

      const order = await prisma.order.findUnique({
        where: { id: parseInt(orderId) },
        select: { id: true, orderNumber: true, qrCode: true, userId: true }
      });

      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      if (order.userId !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      res.json({
        success: true,
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          qrCode: order.qrCode
        }
      });
    } catch (error) {
      console.error('Get QR code error:', error);
      res.status(500).json({ success: false, error: 'Failed to get QR code' });
    }
  }

  // Cancel order
  async cancelOrder(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;

      const order = await prisma.order.findUnique({
        where: { id: parseInt(orderId) },
        include: { items: true }
      });

      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      if (order.userId !== userId) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
        return res.status(400).json({ success: false, error: 'Order cannot be cancelled at this stage' });
      }

      const updatedOrder = await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: { status: 'CANCELLED' }
      });

      // If order was paid by wallet, refund the amount
      if (order.paymentMethod === 'wallet' && order.paymentStatus === 'COMPLETED') {
        const wallet = await prisma.wallet.findUnique({ where: { userId } });
        if (wallet) {
          await prisma.$transaction([
            prisma.wallet.update({
              where: { id: wallet.id },
              data: { balance: { increment: order.totalAmount } },
            }),
            prisma.walletTransaction.create({
              data: {
                walletId: wallet.id,
                type: 'CREDIT',
                amount: order.totalAmount,
                description: `Refund for cancelled order ${order.orderNumber}`,
                referenceId: order.orderNumber,
              },
            }),
          ]);
        }
      }

      res.json({
        success: true,
        data: updatedOrder,
        message: 'Order cancelled successfully'
      });
    } catch (error) {
      console.error('Cancel order error:', error);
      res.status(500).json({ success: false, error: 'Failed to cancel order' });
    }
  }
}

export default new OrderController();
