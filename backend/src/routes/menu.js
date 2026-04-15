import express from 'express';
import menuController from '../controllers/menuController.js';
import { authenticate, authenticateVendor, authorizeRoles } from '../middleware/authMiddleware.js';
import ValidationMiddleware from '../middleware/validationMiddleware.js';

const router = express.Router();

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────

router.get('/', menuController.getMenuItems);
router.get('/categories', menuController.getCategories);
router.get('/featured', menuController.getFeaturedItems);
router.get('/:itemId', menuController.getMenuItem);

// ─── VENDOR ROUTES ────────────────────────────────────────────────────────

router.get('/vendor/items', authenticateVendor, menuController.getVendorMenuItems);
router.post('/vendor/items', authenticateVendor, ValidationMiddleware.validateMenuItem, menuController.createMenuItem);
router.put('/vendor/items/:itemId', authenticateVendor, ValidationMiddleware.validateMenuItem, menuController.updateMenuItem);
router.delete('/vendor/items/:itemId', authenticateVendor, menuController.deleteMenuItem);
router.patch('/vendor/items/:itemId/availability', authenticateVendor, menuController.toggleAvailability);

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────

router.get('/admin/all', authenticate, authorizeRoles(['admin']), menuController.getAllMenuItems);

export default router;
