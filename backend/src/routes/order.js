import express from 'express';
const router = express.Router();
import orderController from '../controllers/orderController.js';
import { authenticate as authenticateUser, authenticate as authenticateVendor, authorizeRoles } from '../middleware/authMiddleware.js';
import ValidationMiddleware from '../middleware/validationMiddleware.js';

// User routes
router.post('/', authenticateUser, ValidationMiddleware.validateOrderCreation, orderController.createOrder);
router.get('/my-orders', authenticateUser, orderController.getUserOrders);
router.put('/:orderId/cancel', authenticateUser, orderController.cancelOrder);

// Vendor routes
router.put('/:orderId/status', authenticateVendor, ValidationMiddleware.validateStatusUpdate, orderController.updateOrderStatus);

// QR Code routes
router.post('/validate-qr', authenticateUser, orderController.validateQRCode);
router.get('/:orderId/qr', authenticateUser, orderController.getOrderQRCode);

export default router;
