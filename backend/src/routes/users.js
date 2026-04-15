import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import ValidationMiddleware from '../middleware/validationMiddleware.js';

const router = express.Router();

// ─── USER PROFILE ROUTES ──────────────────────────────────────────────────

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, ValidationMiddleware.validateProfileUpdate, userController.updateProfile);
router.put('/change-password', authenticate, userController.changePassword);
router.get('/stats', authenticate, userController.getUserStats);
router.delete('/account', authenticate, userController.deleteAccount);

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────

router.get('/all', authenticate, authorizeRoles(['admin']), userController.getAllUsers);
router.put('/:userId/status', authenticate, authorizeRoles(['admin']), userController.updateUserStatus);
router.get('/analytics', authenticate, authorizeRoles(['admin']), userController.getUserAnalytics);

export default router;
