import { prisma } from '../models/index.js';
import bcrypt from 'bcryptjs';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        userType: true,
        createdAt: true,
        wallet: {
          select: {
            balance: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phone } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if phone is already taken by another user
    if (phone && phone !== user.phone) {
      const existingUser = await prisma.user.findFirst({
        where: {
          phone,
          id: { not: userId }
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Phone number already in use'
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: fullName || user.fullName,
        phone: phone || user.phone
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        userType: true
      }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedNewPassword
      }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [orderStats, reservationStats] = await Promise.all([
      prisma.order.groupBy({
        by: ['status'],
        where: { userid: userId },
        _count: { id: true },
        _sum: { totalprice: true }
      }),
      prisma.reservation.groupBy({
        by: ['status'],
        where: { userid: userId },
        _count: { id: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        orders: orderStats.map(stat => ({
          status: stat.status,
          count: stat._count.id,
          totalSpent: stat._sum.totalprice || 0
        })),
        reservations: reservationStats.map(stat => ({
          status: stat.status,
          count: stat._count.id
        }))
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics'
    });
  }
};

// Delete user account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify password before deletion
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Password is incorrect'
      });
    }

    // Check for active orders/reservations
    const [activeOrders, activeReservations] = await Promise.all([
      prisma.order.count({
        where: {
          userid: userId,
          status: { in: ['pending', 'confirmed', 'preparing', 'ready'] }
        }
      }),
      prisma.reservation.count({
        where: {
          userid: userId,
          status: { in: ['pending', 'confirmed'] }
        }
      })
    ]);

    if (activeOrders > 0 || activeReservations > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete account with active orders or reservations'
      });
    }

    // Soft delete user
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted_${userId}@deleted.com`,
        phone: `deleted_${userId}`,
        fullName: 'Deleted User'
      }
    });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete account'
    });
  }
};

// Admin: Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        userType: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
};

// Admin: Update user status
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { userType } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { userType }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user status'
    });
  }
};

// Admin: Get user analytics
export const getUserAnalytics = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const usersByType = await prisma.user.groupBy({
      by: ['userType'],
      _count: { id: true }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        usersByType
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
};
