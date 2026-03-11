import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Authenticate user middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    let user = null;

    if (decoded.role === 'vendor') {
      user = await prisma.vendor.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          isactive: true,
          createdat: true,
          updatedat: true
        }
      });
      if (user) {
        user.userType = 'vendor'; // Normalizing role for authorizeRoles middleware
      }
    } else {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          userType: true,
          createdAt: true,
          updatedAt: true
        }
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token or user not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired.'
      });
    }

    console.error('Auth error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed.'
    });
  }
};

// Role-based authorization
const authorizeRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.userType || 'guest';

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Insufficient permissions.'
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        error: 'Authorization failed.'
      });
    }
  };
};

// Premium user validation
const requirePremium = (req, res, next) => {
  try {
    if (req.user.userType !== 'premium') {
      return res.status(403).json({
        success: false,
        error: 'Premium membership required for this feature.'
      });
    }
    next();
  } catch (error) {
    console.error('Premium check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Premium validation failed.'
    });
  }
};

// Admin authentication
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    let user = null;
    if (decoded.role !== 'vendor') {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          userType: true,
          createdAt: true,
          updatedAt: true
        }
      });
    }

    if (!user || user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(500).json({
      success: false,
      error: 'Admin authentication failed.'
    });
  }
};

// Optional authentication (for public endpoints that can benefit from auth)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        userType: true,
        createdAt: true,
        updatedAt: true
      }
    });

    req.user = user || null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

export {
  authenticate,
  authenticate as authenticateUser,
  authenticate as authenticateVendor,
  authorizeRoles,
  requirePremium,
  authenticateAdmin,
  optionalAuth
};
