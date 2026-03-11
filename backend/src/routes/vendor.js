import express from 'express';
import { vendorLogin, getDashboardStats, getSalesData, getAnalytics } from '../controllers/vendorController.js';
import menuController from '../controllers/menuController.js';
import orderController from '../controllers/orderController.js';
import reservationController from '../controllers/reservationController.js';
import { authenticateVendor } from '../middleware/authMiddleware.js';
import ValidationMiddleware from '../middleware/validationMiddleware.js';

const router = express.Router();

// Auth
router.post('/auth/login', vendorLogin);

// Protect all following routes
router.use(authenticateVendor);

// Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/sales', getSalesData);
router.get('/analytics', getAnalytics);

// Orders
router.get('/orders', orderController.getVendorOrders);
router.get('/orders/:orderId', orderController.getOrderDetails);
router.put('/orders/:orderId', ValidationMiddleware.validateStatusUpdate, orderController.updateOrderStatus);

// Menu
router.get('/menu', menuController.getVendorMenuItems);
router.post('/menu', ValidationMiddleware.validateMenuItem, menuController.createMenuItem);
router.put('/menu/:itemId', ValidationMiddleware.validateMenuItem, menuController.updateMenuItem);
router.delete('/menu/:itemId', menuController.deleteMenuItem);

// Reservations
router.get('/reservations', reservationController.getVendorReservations);
router.put('/reservations/:reservationId/status', reservationController.updateReservationStatus);

export default router;
