import prisma from '../utils/database.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

/**
 * UserService — encapsulates user business logic.
 * Handles profile CRUD, stats aggregation, and account management.
 */
class UserService {
  /**
   * Get user profile with wallet balance.
   */
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        userType: true,
        createdAt: true,
        wallet: { select: { balance: true } },
        smartPass: { select: { tier: true, status: true, discountPercent: true } },
      },
    });

    if (!user) throw { status: 404, message: 'User not found' };
    return user;
  }

  /**
   * Update user profile fields.
   */
  async updateProfile(userId, { fullName, phone }) {
    // Check phone uniqueness if changing
    if (phone) {
      const existing = await prisma.user.findFirst({
        where: { phone, id: { not: userId } },
      });
      if (existing) throw { status: 400, message: 'Phone number already in use' };
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        userType: true,
      },
    });
  }

  /**
   * Change user password after verifying current password.
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw { status: 404, message: 'User not found' };

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw { status: 400, message: 'Current password is incorrect' };

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    logger.info('UserService', `Password changed for user ${userId}`);
  }

  /**
   * Get user order and reservation statistics.
   */
  async getUserStats(userId) {
    const [orderStats, reservationStats] = await Promise.all([
      prisma.order.groupBy({
        by: ['status'],
        where: { userId },
        _count: { id: true },
        _sum: { totalAmount: true },
      }),
      prisma.reservation.groupBy({
        by: ['status'],
        where: { userId },
        _count: { id: true },
      }),
    ]);

    return {
      orders: orderStats.map((s) => ({
        status: s.status,
        count: s._count.id,
        totalSpent: s._sum.totalAmount || 0,
      })),
      reservations: reservationStats.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
    };
  }

  /**
   * Soft-delete a user account after verifying password and checking for active orders.
   */
  async deleteAccount(userId, password) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw { status: 404, message: 'User not found' };

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw { status: 400, message: 'Password is incorrect' };

    const [activeOrders, activeReservations] = await Promise.all([
      prisma.order.count({
        where: { userId, status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'] } },
      }),
      prisma.reservation.count({
        where: { userId, status: { in: ['PENDING', 'CONFIRMED'] } },
      }),
    ]);

    if (activeOrders > 0 || activeReservations > 0) {
      throw { status: 400, message: 'Cannot delete account with active orders or reservations' };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted_${userId}@deleted.com`,
        phone: `deleted_${userId}`,
        fullName: 'Deleted User',
        isActive: false,
      },
    });

    logger.info('UserService', `Account soft-deleted for user ${userId}`);
  }
}

export default new UserService();
