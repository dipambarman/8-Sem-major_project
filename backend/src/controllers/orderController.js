import prisma from '../utils/database.js';
import qrCodeService from '../services/qrCodeService.js';

class OrderController {
  // Create order
  async createOrder(req, res) {
    try {
      const { items, orderType, paymentMethod, slotTime, specialInstructions } = req.body;
      const userId = req.user.id;

      // Calculate total amount
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId }
        });
        
        if (!menuItem || !menuItem.isAvailable) {
          return res.status(400).json({
            success: false,
            error: 'Some items are not available'
          });
        }

        const itemTotal = Number(menuItem.price) * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: menuItem.price,
          specialInstructions: item.specialInstructions
        });
      }

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Create a temporary order ID for QR generation (we'll use orderNumber as unique identifier)
      const tempOrderId = `temp-${Date.now()}`;
      const qrCode = await qrCodeService.generateOrderQR(tempOrderId, orderNumber);

      // Create order with items
      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId,
          vendorId: orderItems[0].menuItemId, // Assuming single vendor
          orderType,
          totalAmount,
          paymentMethod,
          slotTime: slotTime ? new Date(slotTime) : null,
          specialInstructions,
          qrCode,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          items: {
            create: orderItems
          }
        },
        include: {
          items: {
            include: {
              menuItem: true
            }
          },
          user: {
            select: { id: true, fullName: true, email: true }
          },
          vendor: {
            select: { id: true, name: true }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: order,
        message: 'Order created successfully'
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create order'
      });
    }
  }

  // Get user orders
  async getUserOrders(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: { menuItem: true }
          },
          vendor: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      });

      const total = await prisma.order.count({ where: { userId } });

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            total,
            page,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders'
      });
    }
  }

  // Get vendor orders
  async getVendorOrders(req, res) {
    try {
      const vendorId = req.vendor.id;
      const { status, page = 1, limit = 20 } = req.query;

      const where = {
        items: {
          some: {
            menuItem: { vendorid: vendorId }
          }
        }
      };

      if (status) {
        where.status = status;
      }

      const orders = await prisma.order.findMany({
        where,
        include: {
          items: { include: { menuItem: true } },
          user: { select: { id: true, fullName: true, phone: true } }
        },
        orderBy: { orderedat: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      });

      const total = await prisma.order.count({ where });

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get vendor orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vendor orders'
      });
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
          Payment: true
        }
      });

      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      // If requested by a vendor, ensure this order belongs to them
      if (req.vendor) {
        const belongsToVendor = order.items.some(item => item.menuItem.vendorid === req.vendor.id);
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
      res.status(500).json({
        success: false,
        error: 'Failed to update order status'
      });
    }
  }

  // Validate QR code for order pickup/delivery
  async validateQRCode(req, res) {
    try {
      const { qrData } = req.body;

      const validation = qrCodeService.validateQRData(qrData);

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: validation.error
        });
      }

      const { data } = validation;

      if (data.type === 'order') {
        // Find order by orderNumber
        const order = await prisma.order.findUnique({
          where: { orderNumber: data.orderNumber },
          include: {
            items: {
              include: { menuItem: true }
            },
            user: {
              select: { id: true, fullName: true, email: true }
            },
            vendor: {
              select: { id: true, name: true }
            }
          }
        });

        if (!order) {
          return res.status(404).json({
            success: false,
            error: 'Order not found'
          });
        }

        // Check if order can be validated (e.g., in correct status)
        if (order.status !== 'READY' && order.status !== 'PREPARING') {
          return res.status(400).json({
            success: false,
            error: 'Order is not ready for pickup/delivery'
          });
        }

        res.json({
          success: true,
          data: {
            order,
            qrValid: true
          },
          message: 'QR code validated successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid QR code type'
        });
      }
    } catch (error) {
      console.error('QR validation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate QR code'
      });
    }
  }

  // Get order QR code
  async getOrderQRCode(req, res) {
    try {
      const { orderId } = req.params;

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          orderNumber: true,
          qrCode: true,
          userId: true
        }
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      // Check if user owns this order
      if (order.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
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
      res.status(500).json({
        success: false,
        error: 'Failed to get QR code'
      });
    }
  }

  // Cancel order
  async cancelOrder(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true
        }
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      // Check if user owns this order
      if (order.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Check if order can be cancelled
      if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
        return res.status(400).json({
          success: false,
          error: 'Order cannot be cancelled at this stage'
        });
      }

      // Update order status
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' }
      });

      res.json({
        success: true,
        data: updatedOrder,
        message: 'Order cancelled successfully'
      });
    } catch (error) {
      console.error('Cancel order error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel order'
      });
    }
  }
}

export default new OrderController();
