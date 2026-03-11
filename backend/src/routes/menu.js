import express from 'express';
const router = express.Router();
import menuController from '../controllers/menuController.js';
import { authenticate as authenticateVendor, authenticate as authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';
import ValidationMiddleware from '../middleware/validationMiddleware.js';

// Public routes
router.get('/', menuController.getMenuItems);
router.get('/categories', menuController.getCategories);
router.get('/featured', menuController.getFeaturedItems);
router.get('/:itemId', menuController.getMenuItem);

// Vendor routes
router.get('/vendor/items', authenticateVendor, menuController.getVendorMenuItems);
router.post('/vendor/items', authenticateVendor, ValidationMiddleware.validateMenuItem, menuController.createMenuItem);
router.put('/vendor/items/:itemId', authenticateVendor, ValidationMiddleware.validateMenuItem, menuController.updateMenuItem);
router.delete('/vendor/items/:itemId', authenticateVendor, menuController.deleteMenuItem);
router.patch('/vendor/items/:itemId/availability', authenticateVendor, menuController.toggleAvailability);

// Admin routes
router.get('/admin/all', authenticateUser, authorizeRoles(['admin']), menuController.getAllMenuItems);

export default router;
