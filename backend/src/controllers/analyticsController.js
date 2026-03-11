import { prisma } from '../models/index.js';

// Get Dashboard Analytics
export const getDashboardAnalytics = async (req, res) => {
  try {
    // Basic counts
    const totalUsers = await prisma.user.count();
    const totalOrders = await prisma.order.count();
    
    // Revenue
    const revenueResult = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'success' }
    });
    const totalRevenue = revenueResult._sum.amount || 0;

    // Active users
    const activeUsers = await prisma.user.count({
      where: {
        updatedAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30))
        }
      }
    });

    // Orders status distribution
    const orderStatsRaw = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    const colors = {
      'completed': '#4CAF50',
      'processing': '#FF9800',
      'cancelled': '#f44336',
      'pending': '#2196F3',
      'ready': '#8BC34A'
    };

    const orderStats = orderStatsRaw.map(stat => ({
      name: stat.status.charAt(0).toUpperCase() + stat.status.slice(1),
      value: stat._count.id,
      color: colors[stat.status] || '#9E9E9E'
    }));

    // Example User Growth (fake implementation for last 6 months based on createdAt)
    const userGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
      const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() - i + 1, 0);
      
      const userCount = await prisma.user.count({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      });
      userGrowth.push({
        month: startOfMonth.toLocaleString('default', { month: 'short' }),
        users: userCount
      });
    }

    // Daily Revenue this week
    const revenueData = [];
    for (let i = 6; i >= 0; i--) {
      const startOfDay = new Date();
      startOfDay.setDate(startOfDay.getDate() - i);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setDate(endOfDay.getDate() - i);
      endOfDay.setHours(23, 59, 59, 999);

      const dayRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'success',
          createdat: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });

      revenueData.push({
        day: startOfDay.toLocaleString('default', { weekday: 'short' }),
        revenue: dayRevenue._sum.amount || 0
      });
    }

    res.json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalRevenue,
        activeUsers,
        orderStatusDistribution: orderStats,
        userGrowth,
        dailyRevenue: revenueData
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate analytics data'
    });
  }
};
