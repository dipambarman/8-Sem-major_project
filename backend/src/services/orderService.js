import prisma from '../utils/database.js';
import qrCodeService from './qrCodeService.js';
import logger from '../utils/logger.js';
import { generateOrderNumber, calculateSmartPassDiscount } from '../utils/helpers.js';

/**
 * OrderService — encapsulates order business logic.
 * Handles pricing, SmartPass discounts, wallet payments, and QR code generation.
 */
class OrderService {
  /**
   * Resolve order items from cart, validate availability, and compute totals.
   * @returns {{ orderItems, totalAmount, vendorId }}
   */
  async resolveOrderItems(items) {
    let totalAmount = 0;
    let resolvedVendorId = null;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
      });

      if (!menuItem || !menuItem.isAvailable) {
        throw { status: 400, message: `Menu item ${item.menuItemId} is not available` };
      }

      if (!resolvedVendorId) {
        resolvedVendorId = menuItem.vendorId;
      }

      const itemTotal = Number(menuItem.price) * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price,
        specialInstructions: item.specialInstructions || null,
      });
    }

    return { orderItems, totalAmount, vendorId: resolvedVendorId };
  }

  /**
   * Apply SmartPass discount if user has an active membership.
   * @returns {{ discountedTotal, smartPassDiscount }}
   */
  async applySmartPassDiscount(userId, totalAmount) {
    const smartPass = await prisma.smartPass.findUnique({
      where: { userId },
    });

    if (smartPass && smartPass.status === 'ACTIVE') {
      const discount = calculateSmartPassDiscount(totalAmount, smartPass.tier);
      return {
        discountedTotal: totalAmount - discount,
        smartPassDiscount: discount,
      };
    }

    return { discountedTotal: totalAmount, smartPassDiscount: 0 };
  }

  /**
   * Process wallet payment — debit user wallet.
   * @returns {boolean} success
   */
  async processWalletPayment(userId, amount) {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });

    if (!wallet || wallet.balance < amount) {
      throw { status: 400, message: 'Insufficient wallet balance' };
    }

    await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } },
      }),
      prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'DEBIT',
          amount,
          description: `Order payment`,
        },
      }),
    ]);

    return true;
  }

  /**
   * Create a complete order with items, QR code, and optional payment processing.
   */
  async createOrder(userId, { items, orderType, paymentMethod, slotTime, specialInstructions }) {
    // 1. Resolve items and compute totals
    const { orderItems, totalAmount, vendorId } = await this.resolveOrderItems(items);

    // 2. Apply SmartPass discount
    const { discountedTotal, smartPassDiscount } = await this.applySmartPassDiscount(userId, totalAmount);

    // 3. Generate order number and QR code
    const orderNumber = generateOrderNumber();
    const qrCode = await qrCodeService.generateOrderQR(`order-${Date.now()}`, orderNumber);

    // 4. Process wallet payment if applicable
    let paymentStatus = 'PENDING';
    let orderStatus = 'PENDING';

    if (paymentMethod === 'wallet') {
      await this.processWalletPayment(userId, discountedTotal);
      paymentStatus = 'COMPLETED';
      orderStatus = 'CONFIRMED';
    }

    // 5. Create the order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        vendorId,
        orderType,
        totalAmount: discountedTotal,
        paymentMethod,
        slotTime: slotTime ? new Date(slotTime) : null,
        specialInstructions,
        qrCode,
        status: orderStatus,
        paymentStatus,
        smartPassDiscount,
        items: { create: orderItems },
      },
      include: {
        items: { include: { menuItem: true } },
        user: { select: { id: true, fullName: true, email: true } },
        vendor: { select: { id: true, name: true } },
      },
    });

    logger.info('OrderService', `Order ${orderNumber} created for user ${userId}, total: ₹${discountedTotal}`);

    return order;
  }
}

export default new OrderService();
