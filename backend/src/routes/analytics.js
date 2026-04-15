import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import { getDashboardAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────

router.get('/dashboard', authenticate, authorizeRoles(['admin']), getDashboardAnalytics);

export default router;
