import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  broadcastNotification
} from '../controllers/notificationController.js';

const router = express.Router();

// ─── USER ROUTES ──────────────────────────────────────────────────────────

router.get('/', authenticate, getNotifications);
router.put('/read-all', authenticate, markAllAsRead);
router.put('/:notificationId/read', authenticate, markAsRead);

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────

router.post('/broadcast', authenticate, authorizeRoles(['admin']), broadcastNotification);

export default router;
