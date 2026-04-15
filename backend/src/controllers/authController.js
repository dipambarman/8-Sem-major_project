import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/database.js';

/**
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    if (!email || !password || !fullName || !phone) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    // Check for existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'User already exists with this email' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user + wallet in a transaction
    const { user, wallet } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, passwordHash, fullName, phone, userType: 'REGULAR' }
      });

      const wallet = await tx.wallet.create({
        data: { userId: user.id, balance: 0.00 }
      });

      return { user, wallet };
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          userType: user.userType,
          createdAt: user.createdAt
        },
        token,
        wallet: { balance: wallet.balance }
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Failed to register user' });
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, error: 'Account is deactivated' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Fetch wallet balance
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });

    // Fetch SmartPass status
    const smartPass = await prisma.smartPass.findUnique({ where: { userId: user.id } });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          userType: user.userType,
          createdAt: user.createdAt
        },
        token,
        wallet: wallet ? { balance: wallet.balance } : { balance: 0.00 },
        smartPass: smartPass ? {
          tier: smartPass.tier,
          status: smartPass.status,
          discountPercent: smartPass.discountPercent
        } : null
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Failed to login' });
  }
};

/**
 * POST /api/auth/admin/login
 */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.userType !== 'ADMIN') {
      return res.status(401).json({ success: false, error: 'Invalid credentials or unauthorized' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.userType
      },
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, error: 'Failed to login' });
  }
};

/**
 * GET /api/auth/profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        userType: user.userType,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      message: 'Profile retrieved successfully'
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve profile' });
  }
};

/**
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal whether the email exists — security best practice
      return res.json({
        success: true,
        message: 'If an account with that email exists, password reset instructions have been sent.'
      });
    }

    // TODO: Implement actual email sending
    // await sendPasswordResetEmail(user.email, generateResetToken(user.id));

    res.json({
      success: true,
      message: 'If an account with that email exists, password reset instructions have been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Failed to process password reset request' });
  }
};

/**
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    console.log(`User ${req.user.email} logged out at ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, error: 'Failed to logout' });
  }
};
