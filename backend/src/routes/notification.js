import express from 'express';
const router = express.Router();
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  broadcastNotification
} from '../controllers/notificationController.js';

// User notification routes
router.get('/', authenticateUser, getNotifications);

router.put('/read-all', authenticateUser, markAllAsRead);

router.put('/:notificationId/read', authenticateUser, markAsRead);

// Admin routes
router.post('/broadcast', authenticateUser, authorizeRoles(['admin']), broadcastNotification);

export default router;
