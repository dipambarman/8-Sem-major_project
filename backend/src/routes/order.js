import express from 'express';
import orderController from '../controllers/orderController.js';
import { authenticate, authenticateVendor } from '../middleware/authMiddleware.js';
import ValidationMiddleware from '../middleware/validationMiddleware.js';

const router = express.Router();

// ─── USER ROUTES ──────────────────────────────────────────────────────────

router.post('/', authenticate, ValidationMiddleware.validateOrderCreation, orderController.createOrder);
router.get('/my-orders', authenticate, orderController.getUserOrders);
router.put('/:orderId/cancel', authenticate, orderController.cancelOrder);

// ─── QR CODE ROUTES ───────────────────────────────────────────────────────

router.post('/validate-qr', authenticate, orderController.validateQRCode);
router.get('/:orderId/qr', authenticate, orderController.getOrderQRCode);

// ─── VENDOR ROUTES ────────────────────────────────────────────────────────

router.put('/:orderId/status', authenticateVendor, ValidationMiddleware.validateStatusUpdate, orderController.updateOrderStatus);

export default router;
