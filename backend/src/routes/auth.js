import express from 'express';
import { login, register, forgotPassword, resetPassword, getProfile, logout, adminLogin } from '../controllers/authController.js';
import ValidationMiddleware from '../middleware/validationMiddleware.js';
import { authenticate } from '../middleware/authMiddleware.js';
import SecurityMiddleware from '../middleware/securityMiddleware.js';

const router = express.Router();

// Public routes (with auth rate limiter)
router.post('/login', SecurityMiddleware.authLimiter, ValidationMiddleware.validateLogin, login);
router.post('/register', SecurityMiddleware.authLimiter, ValidationMiddleware.validateRegister, register);
router.post('/forgot-password', SecurityMiddleware.authLimiter, forgotPassword);
router.post('/reset-password', SecurityMiddleware.authLimiter, resetPassword);
router.post('/admin/login', SecurityMiddleware.authLimiter, adminLogin);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.post('/logout', authenticate, logout);

export default router;
