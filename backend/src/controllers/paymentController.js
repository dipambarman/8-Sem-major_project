import prisma from '../utils/database.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay only if credentials are available
// Moved validation to method to ensure env vars are loaded
// let razorpay = null; 


class PaymentController {
  // Helper to get initialized Razorpay instance
  _getRazorpayInstance() {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
    }
    return null;
  }

  // Create Razorpay order
  async createRazorpayOrder(req, res) {
    try {
      const razorpay = this._getRazorpayInstance();
      if (!razorpay) {
        console.error('Razorpay credentials missing in createRazorpayOrder');
        return res.status(500).json({
          success: false,
          error: 'Payment configuration missing on server'
        });
      }

      const { amount, orderId, currency = 'INR' } = req.body;
      const userId = req.user.id;

      // Validate order exists
      if (orderId) {
        const order = await prisma.order.findFirst({
          where: { id: orderId, userId }
        });

        if (!order) {
          return res.status(404).json({
            success: false,
            error: 'Order not found'
          });
        }
      }

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt: `receipt_${Date.now()}`,
        notes: {
          userId,
          orderId: orderId || 'wallet_topup'
        }
      });

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          userId,
          orderId: orderId || null,
          amount,
          paymentMethod: 'RAZORPAY',
          paymentType: orderId ? 'ORDER_PAYMENT' : 'WALLET_TOPUP',
          status: 'PENDING',
          razorpayOrderId: razorpayOrder.id
        }
      });

      res.json({
        success: true,
        data: {
          razorpayOrderId: razorpayOrder.id,
          paymentId: payment.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key: process.env.RAZORPAY_KEY_ID
        }
      });

    } catch (error) {
      console.error('Create Razorpay order error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create payment order'
      });
    }
  }

  // Verify Razorpay payment
  async verifyRazorpayPayment(req, res) {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        paymentId
      } = req.body;

      if (!process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('RAZORPAY_KEY_SECRET missing');
      }

      // Verify signature
      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

      if (razorpay_signature !== expectedSign) {
        return res.status(400).json({
          success: false,
          error: 'Invalid payment signature'
        });
      }

      // Find payment record
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          order: true
        }
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment record not found'
        });
      }

      // Update payment record
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'COMPLETED',
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          paymentTime: new Date(),
          paymentResponse: {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
          }
        }
      });

      // Process based on payment type
      if (payment.paymentType === 'WALLET_TOPUP') {
        // Add money to wallet
        await prisma.wallet.updateMany({
          where: { userId: payment.userId },
          data: {
            balance: {
              increment: payment.amount
            }
          }
        });
      } else if (payment.paymentType === 'ORDER_PAYMENT' && payment.order) {
        // Update order status
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: 'COMPLETED',
            status: 'CONFIRMED',
            paymentId: razorpay_payment_id
          }
        });
      }

      res.json({
        success: true,
        data: updatedPayment,
        message: 'Payment verified successfully'
      });

    } catch (error) {
      console.error('Verify Razorpay payment error:', error);
      res.status(500).json({
        success: false,
        error: 'Payment verification failed'
      });
    }
  }

  // Get payment history
  async getPaymentHistory(req, res) {
    try {
      const userId = req.user.id;
      const { type, status, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = { userId };
      if (type) whereClause.paymentType = type;
      if (status) whereClause.status = status;

      const payments = await prisma.payment.findMany({
        where: whereClause,
        include: {
          order: {
            select: { id: true, orderNumber: true, totalAmount: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: parseInt(limit)
      });

      const total = await prisma.payment.count({ where: whereClause });

      res.json({
        success: true,
        data: {
          payments,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get payment history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payment history'
      });
    }
  }

  // Initiate refund
  async initiateRefund(req, res) {
    try {
      const { paymentId, reason } = req.body;
      const userId = req.user.id;

      const payment = await prisma.payment.findFirst({
        where: { id: paymentId, userId }
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
      }

      // Check if payment can be refunded (within 7 days and completed)
      const paymentTime = new Date(payment.paymentTime);
      const now = new Date();
      const daysDiff = (now - paymentTime) / (1000 * 60 * 60 * 24);

      if (payment.status !== 'COMPLETED' || daysDiff > 7) {
        return res.status(400).json({
          success: false,
          error: 'Payment cannot be refunded'
        });
      }

      // For Razorpay payments, initiate refund
      if (payment.paymentMethod === 'RAZORPAY' && payment.razorpayPaymentId) {
        const razorpay = this._getRazorpayInstance();
        if (!razorpay) {
          throw new Error('Razorpay not initialized');
        }
        const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
          amount: Math.round(payment.amount * 100), // Convert to paise
          notes: { reason }
        });

        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: 'REFUNDED',
            refundAmount: payment.amount,
            refundTime: new Date(),
            refundTransactionId: refund.id
          }
        });
      }
      // For wallet payments, directly add back to wallet
      else if (payment.paymentMethod === 'WALLET') {
        await prisma.wallet.updateMany({
          where: { userId },
          data: {
            balance: {
              increment: payment.amount
            }
          }
        });

        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: 'REFUNDED',
            refundAmount: payment.amount,
            refundTime: new Date()
          }
        });
      }

      const updatedPayment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });

      res.json({
        success: true,
        data: updatedPayment,
        message: 'Refund initiated successfully'
      });

    } catch (error) {
      console.error('Initiate refund error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to initiate refund'
      });
    }
  }

  // Get all payments (Admin only)
  async getAllPayments(req, res) {
    try {
      const { type, status, page = 1, limit = 20, userId } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (type) whereClause.paymentType = type;
      if (status) whereClause.status = status;
      if (userId) whereClause.userId = userId;

      const payments = await prisma.payment.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          order: {
            select: { id: true, orderNumber: true, totalAmount: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: parseInt(limit)
      });

      const total = await prisma.payment.count({ where: whereClause });

      res.json({
        success: true,
        data: {
          payments,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get all payments error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payments'
      });
    }
  }

  // Get payment analytics (Admin only)
  async getPaymentAnalytics(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const dateFilter = {};
      if (startDate && endDate) {
        dateFilter.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }

      // Total payments
      const totalPayments = await prisma.payment.count({
        where: dateFilter
      });

      // Total revenue
      const totalRevenue = await prisma.payment.aggregate({
        where: {
          ...dateFilter,
          status: 'COMPLETED'
        },
        _sum: {
          amount: true
        }
      });

      // Payment methods breakdown
      const paymentMethods = await prisma.payment.groupBy({
        by: ['paymentMethod'],
        where: dateFilter,
        _count: {
          id: true
        },
        _sum: {
          amount: true
        }
      });

      // Payment types breakdown
      const paymentTypes = await prisma.payment.groupBy({
        by: ['paymentType'],
        where: dateFilter,
        _count: {
          id: true
        },
        _sum: {
          amount: true
        }
      });

      // Status breakdown
      const statusBreakdown = await prisma.payment.groupBy({
        by: ['status'],
        where: dateFilter,
        _count: {
          id: true
        },
        _sum: {
          amount: true
        }
      });

      res.json({
        success: true,
        data: {
          totalPayments,
          totalRevenue: totalRevenue._sum.amount || 0,
          paymentMethods,
          paymentTypes,
          statusBreakdown
        }
      });

    } catch (error) {
      console.error('Get payment analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payment analytics'
      });
    }
  }
}

export default new PaymentController();
