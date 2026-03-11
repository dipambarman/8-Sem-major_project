import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../models/index.js';

export const vendorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find vendor
    const vendor = await prisma.vendor.findUnique({ where: { email } });
    if (!vendor) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    if (!vendor.isactive) {
      return res.status(403).json({
        success: false,
        error: 'Vendor account is inactive'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, vendor.password);
    
    // Fallback plain-text check for unmigrated seeded data
    const isPlainMatch = password === vendor.password;

    if (!isValidPassword && !isPlainMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: vendor.id, email: vendor.email, role: 'vendor' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const vendorResponse = {
      id: vendor.id,
      name: vendor.name,
      email: vendor.email,
      isActive: vendor.isactive,
      createdAt: vendor.createdat,
      role: 'vendor'
    };

    res.json({
      success: true,
      data: {
        vendor: vendorResponse,
        token
      },
      message: 'Vendor login successful'
    });

  } catch (error) {
    console.error('Vendor login error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to login'
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const vendorId = req.vendor.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, todayOrders, menuItemsCount, revenueResult] = await Promise.all([
      prisma.order.count({ where: { items: { some: { menuItem: { vendorid: vendorId } } } } }),
      prisma.order.count({
        where: { 
          orderedat: { gte: today },
          items: { some: { menuItem: { vendorid: vendorId } } }
        }
      }),
      prisma.menuItem.count({ where: { vendorid: vendorId } }),
      prisma.order.aggregate({
        _sum: { totalprice: true },
        where: { 
          status: 'completed',
          items: { some: { menuItem: { vendorid: vendorId } } }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        todayOrders,
        menuItemsCount,
        totalRevenue: revenueResult._sum.totalprice || 0
      }
    });
  } catch (error) {
    console.error('Get vendor dashboard stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
  }
};

export const getSalesData = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    // Basic mock logic or aggregate for recent sales
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed' });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    res.json({
      success: true,
      data: { orderStats: [], revenueData: [], userGrowth: [] }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed' });
  }
};
