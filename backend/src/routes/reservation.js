import express from 'express';
const router = express.Router();
import reservationController from '../controllers/reservationController.js';
import { authenticate as authenticateUser, authenticate as authenticateVendor, authorizeRoles } from '../middleware/authMiddleware.js';
import ValidationMiddleware from '../middleware/validationMiddleware.js';

// User routes
router.post('/', authenticateUser, ValidationMiddleware.validateReservation, reservationController.createReservation);
router.get('/my-reservations', authenticateUser, reservationController.getUserReservations);
router.put('/:reservationId/cancel', authenticateUser, reservationController.cancelReservation);

// Vendor routes
router.get('/vendor', authenticateVendor, reservationController.getVendorReservations);
router.put('/:reservationId/status', authenticateVendor, reservationController.updateReservationStatus);

// Public routes
router.get('/availability/:vendorId', reservationController.checkAvailability);

export default router;
