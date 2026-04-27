import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/database.js';
import { JWT_SECRET, JWT_EXPIRY } from '../config/jwt.js';

/**
 * POST /api/vendor/auth/login
 */
export const vendorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const vendor = await prisma.vendor.findUnique({ where: { email } });
    if (!vendor) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!vendor.isActive) {
      return res.status(403).json({ success: false, error: 'Vendor account is inactive' });
    }

    const isValidPassword = await bcrypt.compare(password, vendor.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: vendor.id, email: vendor.email, role: 'vendor' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.json({
      success: true,
      data: {
        vendor: {
          id: vendor.id,
          name: vendor.name,
          email: vendor.email,
          isActive: vendor.isActive,
          rating: vendor.rating,
          createdAt: vendor.createdAt,
          role: 'vendor'
        },
        token
      },
      message: 'Vendor login successful'
    });
  } catch (error) {
    console.error('Vendor login error:', error);
    res.status(500).json({ success: false, error: 'Failed to login' });
  }
};

/**
 * GET /api/vendor/dashboard
 */
export const getDashboardStats = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, todayOrders, menuItemsCount, revenueResult, pendingOrders] = await Promise.all([
      prisma.order.count({ where: { vendorId } }),
      prisma.order.count({
        where: { vendorId, createdAt: { gte: today } }
      }),
      prisma.menuItem.count({ where: { vendorId } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { vendorId, status: 'COMPLETED' }
      }),
      prisma.order.count({
        where: { vendorId, status: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] } }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        todayOrders,
        menuItemsCount,
        totalRevenue: revenueResult._sum.totalAmount || 0,
        pendingOrders
      }
    });
  } catch (error) {
    console.error('Get vendor dashboard stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
  }
};

/**
 * GET /api/vendor/sales
 * Returns daily sales for the last 7 days.
 */
export const getSalesData = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const salesData = [];

    for (let i = 6; i >= 0; i--) {
      const startOfDay = new Date();
      startOfDay.setDate(startOfDay.getDate() - i);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(startOfDay);
      endOfDay.setHours(23, 59, 59, 999);

      const [dayRevenue, dayOrders] = await Promise.all([
        prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: {
            vendorId,
            status: 'COMPLETED',
            createdAt: { gte: startOfDay, lte: endOfDay }
          }
        }),
        prisma.order.count({
          where: {
            vendorId,
            createdAt: { gte: startOfDay, lte: endOfDay }
          }
        })
      ]);

      salesData.push({
        date: startOfDay.toISOString().split('T')[0],
        day: startOfDay.toLocaleString('default', { weekday: 'short' }),
        revenue: dayRevenue._sum.totalAmount || 0,
        orders: dayOrders
      });
    }

    res.json({ success: true, data: salesData });
  } catch (error) {
    console.error('Get sales data error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch sales data' });
  }
};

/**
 * GET /api/vendor/analytics
 * Returns analytics: top items, order status distribution, revenue breakdown.
 */
export const getAnalytics = async (req, res) => {
  try {
    const vendorId = req.vendor.id;

    const [orderStatusDist, topItems, recentOrders] = await Promise.all([
      // Order status distribution
      prisma.order.groupBy({
        by: ['status'],
        where: { vendorId },
        _count: { id: true }
      }),

      // Top selling items
      prisma.orderItem.groupBy({
        by: ['menuItemId'],
        where: {
          order: { vendorId }
        },
        _sum: { quantity: true },
        _count: { id: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      }),

      // Recent orders count (last 30 days)
      prisma.order.count({
        where: {
          vendorId,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    // Fetch menu item names for top items
    const topItemIds = topItems.map(item => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: topItemIds } },
      select: { id: true, name: true, price: true }
    });

    const topItemsWithNames = topItems.map(item => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      return {
        menuItemId: item.menuItemId,
        name: menuItem?.name || 'Unknown',
        price: menuItem?.price || 0,
        totalQuantity: item._sum.quantity,
        orderCount: item._count.id
      };
    });

    res.json({
      success: true,
      data: {
        orderStatusDistribution: orderStatusDist.map(s => ({
          status: s.status,
          count: s._count.id
        })),
        topSellingItems: topItemsWithNames,
        recentOrdersCount: recentOrders
      }
    });
  } catch (error) {
    console.error('Get vendor analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
};
