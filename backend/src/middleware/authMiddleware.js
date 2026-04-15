import jwt from 'jsonwebtoken';
import prisma from '../utils/database.js';

/**
 * Authenticate user via JWT Bearer token.
 * Sets req.user with user/vendor data.
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'vendor') {
      const vendor = await prisma.vendor.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!vendor || !vendor.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token or vendor account inactive.'
        });
      }

      // Set both req.user (for general middleware) and req.vendor (for vendor-specific logic)
      req.vendor = vendor;
      req.user = { ...vendor, userType: 'vendor' };
    } else {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          userType: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token or user not found.'
        });
      }

      req.user = user;
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired.' });
    }
    console.error('Auth error:', error);
    return res.status(500).json({ success: false, error: 'Authentication failed.' });
  }
};

/**
 * Role-based authorization middleware.
 * Must be used AFTER authenticate.
 * @param {string[]} allowedRoles - Array of allowed roles (e.g., ['admin', 'vendor'])
 */
export const authorizeRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    // Normalize userType to lowercase for comparison
    const userRole = (req.user?.userType || 'guest').toLowerCase();

    if (!allowedRoles.map(r => r.toLowerCase()).includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

/**
 * Authenticate vendor specifically.
 * Alias for authenticate that also validates vendor role.
 */
export const authenticateVendor = async (req, res, next) => {
  await authenticate(req, res, (err) => {
    if (err) return next(err);

    if (!req.vendor) {
      return res.status(403).json({
        success: false,
        error: 'Vendor access required.'
      });
    }

    next();
  });
};

/**
 * Authenticate admin specifically.
 */
export const authenticateAdmin = async (req, res, next) => {
  await authenticate(req, res, (err) => {
    if (err) return next(err);

    const userType = (req.user?.userType || '').toLowerCase();
    if (userType !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required.'
      });
    }

    next();
  });
};

/**
 * SmartPass premium membership check.
 * Must be used AFTER authenticate.
 */
export const requirePremium = async (req, res, next) => {
  try {
    const smartPass = await prisma.smartPass.findUnique({
      where: { userId: req.user.id }
    });

    if (!smartPass || smartPass.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: 'Active SmartPass membership required for this feature.'
      });
    }

    req.smartPass = smartPass;
    next();
  } catch (error) {
    console.error('Premium check error:', error);
    return res.status(500).json({
      success: false,
      error: 'SmartPass validation failed.'
    });
  }
};

/**
 * Optional authentication — sets req.user if token is present, otherwise continues.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
  } catch {
    req.user = null;
    next();
  }
};

// Backward-compatible aliases
export const authenticateUser = authenticate;
