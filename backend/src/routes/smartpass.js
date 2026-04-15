import express from 'express';
import smartPassController from '../controllers/smartPassController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import ValidationMiddleware from '../middleware/validationMiddleware.js';

const router = express.Router();

// ─── USER ROUTES (Authenticated) ──────────────────────────────────────────

router.post('/join', authenticate, ValidationMiddleware.validateSmartPassJoin, smartPassController.joinSmartPass);
router.get('/status', authenticate, smartPassController.getStatus);
router.get('/card', authenticate, smartPassController.getCard);
router.get('/benefits', smartPassController.getBenefits); // Public

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────

router.get('/admin/members', authenticate, authorizeRoles(['admin']), smartPassController.getAllMembers);
router.post('/admin/approve/:smartPassId', authenticate, authorizeRoles(['admin']), smartPassController.approveApplication);
router.post('/admin/link-card', authenticate, authorizeRoles(['admin']), smartPassController.linkPhysicalCard);
router.get('/admin/analytics', authenticate, authorizeRoles(['admin']), smartPassController.getAnalytics);

export default router;
