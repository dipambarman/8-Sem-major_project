import express from 'express';
const router = express.Router();
import paymentController from '../controllers/paymentController.js';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';

// User routes
router.post('/razorpay/create-order', authenticateUser, (req, res) => paymentController.createRazorpayOrder(req, res));
router.post('/razorpay/verify', authenticateUser, (req, res) => paymentController.verifyRazorpayPayment(req, res));
router.get('/history', authenticateUser, (req, res) => paymentController.getPaymentHistory(req, res));
router.post('/refund', authenticateUser, (req, res) => paymentController.initiateRefund(req, res));

// Admin routes
router.get('/all', authenticateUser, authorizeRoles(['admin']), (req, res) => paymentController.getAllPayments(req, res));
router.get('/analytics', authenticateUser, authorizeRoles(['admin']), (req, res) => paymentController.getPaymentAnalytics(req, res));

export default router;
