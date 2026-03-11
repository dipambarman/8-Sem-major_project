import express from 'express';
const router = express.Router();
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  getDashboardAnalytics
} from '../controllers/analyticsController.js';

// Get Dashboard Analytics (Admin only)
router.get('/dashboard', authenticateUser, authorizeRoles(['admin']), getDashboardAnalytics);

export default router;
