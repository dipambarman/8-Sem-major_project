import express from 'express';
import reservationController from '../controllers/reservationController.js';
import { authenticate, authenticateVendor } from '../middleware/authMiddleware.js';
import ValidationMiddleware from '../middleware/validationMiddleware.js';

const router = express.Router();

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────

router.get('/availability/:vendorId', reservationController.checkAvailability);

// ─── USER ROUTES ──────────────────────────────────────────────────────────

router.post('/', authenticate, ValidationMiddleware.validateReservation, reservationController.createReservation);
router.get('/my-reservations', authenticate, reservationController.getUserReservations);
router.put('/:reservationId/cancel', authenticate, reservationController.cancelReservation);

// ─── VENDOR ROUTES ────────────────────────────────────────────────────────

router.get('/vendor', authenticateVendor, reservationController.getVendorReservations);
router.put('/:reservationId/status', authenticateVendor, reservationController.updateReservationStatus);

export default router;
