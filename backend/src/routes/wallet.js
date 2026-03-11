import express from 'express';
const router = express.Router();
import * as walletController from '../controllers/walletController.js';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';

// User wallet routes
router.get('/', authenticateUser, walletController.getWalletBalance);
router.get('/balance', authenticateUser, walletController.getWalletBalance);
router.post('/topup', authenticateUser, walletController.topUpWallet);
router.get('/transactions', authenticateUser, walletController.getTransactionHistory);
router.post('/transfer', authenticateUser, walletController.transferFunds);

// Admin routes
router.get('/all-transactions', authenticateUser, authorizeRoles(['admin']), walletController.getAllTransactions);
router.get('/analytics', authenticateUser, authorizeRoles(['admin']), walletController.getWalletAnalytics);

export default router;
