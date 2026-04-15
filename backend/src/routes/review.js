import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import ValidationMiddleware from '../middleware/validationMiddleware.js';
import {
  addReview,
  getMenuItemReviews,
  deleteReview
} from '../controllers/reviewController.js';

const router = express.Router();

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────

router.get('/menu-item/:menuItemId', getMenuItemReviews);

// ─── USER ROUTES ──────────────────────────────────────────────────────────

router.post('/', authenticate, ValidationMiddleware.validateReview, addReview);

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────

router.delete('/:reviewId', authenticate, authorizeRoles(['admin']), deleteReview);

export default router;
