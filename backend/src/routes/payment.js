import express from 'express';
import paymentController from '../controllers/paymentController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import SecurityMiddleware from '../middleware/securityMiddleware.js';

const router = express.Router();

// ─── USER ROUTES ──────────────────────────────────────────────────────────

router.post('/razorpay/create-order', authenticate, SecurityMiddleware.paymentLimiter, paymentController.createRazorpayOrder.bind(paymentController));
router.post('/razorpay/verify', authenticate, SecurityMiddleware.paymentLimiter, paymentController.verifyRazorpayPayment.bind(paymentController));
router.get('/history', authenticate, paymentController.getPaymentHistory.bind(paymentController));
router.post('/refund', authenticate, paymentController.initiateRefund.bind(paymentController));

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────

router.get('/all', authenticate, authorizeRoles(['admin']), paymentController.getAllPayments.bind(paymentController));
router.get('/analytics', authenticate, authorizeRoles(['admin']), paymentController.getPaymentAnalytics.bind(paymentController));

export default router;
