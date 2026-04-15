import express from 'express';
import { login, register, forgotPassword, getProfile, logout, adminLogin } from '../controllers/authController.js';
import ValidationMiddleware from '../middleware/validationMiddleware.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', ValidationMiddleware.validateLogin, login);
router.post('/register', ValidationMiddleware.validateRegister, register);
router.post('/forgot-password', forgotPassword);
router.post('/admin/login', adminLogin);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.post('/logout', authenticate, logout);

export default router;
