import express from 'express';
const router = express.Router();
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  addReview,
  getMenuItemReviews,
  deleteReview
} from '../controllers/reviewController.js';

// Get reviews for a menu item (Public)
router.get('/menu-item/:menuItemId', getMenuItemReviews);

// Add a review (Authenticated User)
router.post('/', authenticateUser, addReview);

// Delete a review (Admin only)
router.delete('/:reviewId', authenticateUser, authorizeRoles(['admin']), deleteReview);

export default router;
