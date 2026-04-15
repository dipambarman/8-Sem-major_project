import express from 'express';
import * as walletController from '../controllers/walletController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// ─── USER ROUTES ──────────────────────────────────────────────────────────

router.get('/', authenticate, walletController.getWalletBalance);
router.get('/balance', authenticate, walletController.getWalletBalance);
router.post('/topup', authenticate, walletController.topUpWallet);
router.get('/transactions', authenticate, walletController.getTransactionHistory);
router.post('/transfer', authenticate, walletController.transferFunds);

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────

router.get('/all-transactions', authenticate, authorizeRoles(['admin']), walletController.getAllTransactions);
router.get('/analytics', authenticate, authorizeRoles(['admin']), walletController.getWalletAnalytics);

export default router;
