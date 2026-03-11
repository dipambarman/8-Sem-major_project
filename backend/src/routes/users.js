import express from 'express';
const router = express.Router();
import * as userController from '../controllers/userController.js';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';
import ValidationMiddleware from '../middleware/validationMiddleware.js';

// User profile routes
router.get('/profile', authenticateUser, userController.getProfile);
router.put('/profile', authenticateUser, ValidationMiddleware.validateProfileUpdate, userController.updateProfile);
router.put('/change-password', authenticateUser, userController.changePassword);
router.get('/stats', authenticateUser, userController.getUserStats);
router.delete('/account', authenticateUser, userController.deleteAccount);

// Admin routes
router.get('/all', authenticateUser, authorizeRoles(['admin']), userController.getAllUsers);
router.put('/:userId/status', authenticateUser, authorizeRoles(['admin']), userController.updateUserStatus);
router.get('/analytics', authenticateUser, authorizeRoles(['admin']), userController.getUserAnalytics);

export default router;
