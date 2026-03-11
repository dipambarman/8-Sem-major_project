import express from 'express';
import authRoutes from './auth.js';
import orderRoutes from './order.js';
import menuRoutes from './menu.js';
import reservationRoutes from './reservation.js';
import paymentRoutes from './payment.js';
import userRoutes from './users.js';
import walletRoutes from './wallet.js';
import notificationRoutes from './notification.js';
import reviewRoutes from './review.js';
import analyticsRoutes from './analytics.js';
import vendorRoutes from './vendor.js';
import adminRoutes from './admin.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Canteen API is running',
    timestamp: new Date().toISOString()
  });
});

// Route registrations
router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/menu', menuRoutes);
router.use('/reservations', reservationRoutes);
router.use('/payments', paymentRoutes);
router.use('/users', userRoutes);
router.use('/wallet', walletRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/vendor', vendorRoutes);
router.use('/admin', adminRoutes);

export default router;
