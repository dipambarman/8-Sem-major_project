import prisma from '../utils/database.js';
import { verifyPayment } from '../services/paymentService.js';
import { calculateBonus } from '../utils/helpers.js';

/**
 * GET /api/wallet or /api/wallet/balance
 */
export const getWalletBalance = async (req, res) => {
  try {
    let wallet = await prisma.wallet.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: { id: true, fullName: true, userType: true }
        }
      }
    });

    // Auto-create wallet if it doesn't exist
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId: req.user.id, balance: 0 },
        include: {
          user: { select: { id: true, fullName: true, userType: true } }
        }
      });
    }

    res.json({ success: true, data: wallet });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch wallet' });
  }
};

/**
 * POST /api/wallet/topup
 */
export const topUpWallet = async (req, res) => {
  try {
    const { amount, paymentId, orderId, signature } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    // Verify Razorpay payment if credentials provided
    if (paymentId && orderId && signature) {
      const isPaymentValid = verifyPayment(paymentId, orderId, signature);
      if (!isPaymentValid) {
        return res.status(400).json({ success: false, error: 'Invalid payment signature' });
      }
    }

    // Find or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId: req.user.id }
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId: req.user.id, balance: 0 }
      });
    }

    // Calculate bonus based on amount
    const bonusAmount = calculateBonus(amount);
    const totalCredit = amount + bonusAmount;

    // Update wallet balance + create transaction record
    const [updatedWallet] = await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: totalCredit } }
      }),
      prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'CREDIT',
          amount: totalCredit,
          description: `Wallet top-up: ₹${amount} + ₹${bonusAmount} bonus`,
          referenceId: paymentId || null
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        wallet: updatedWallet,
        creditedAmount: totalCredit,
        bonusAmount
      },
      message: `Wallet topped up! ₹${amount} + ₹${bonusAmount} bonus`
    });
  } catch (error) {
    console.error('Top-up error:', error);
    res.status(500).json({ success: false, error: 'Failed to top up wallet' });
  }
};

/**
 * GET /api/wallet/transactions
 */
export const getTransactionHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user.id }
    });

    if (!wallet) {
      return res.json({ success: true, data: { transactions: [], pagination: { total: 0, page: 1, pages: 0 } } });
    }

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.walletTransaction.count({ where: { walletId: wallet.id } })
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
};

/**
 * POST /api/wallet/transfer
 */
export const transferFunds = async (req, res) => {
  try {
    const { recipientEmail, amount, note } = req.body;

    if (!recipientEmail || !amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Recipient email and valid amount are required' });
    }

    const senderWallet = await prisma.wallet.findUnique({
      where: { userId: req.user.id }
    });

    if (!senderWallet || senderWallet.balance < amount) {
      return res.status(400).json({ success: false, error: 'Insufficient balance' });
    }

    const recipient = await prisma.user.findUnique({ where: { email: recipientEmail } });
    if (!recipient) {
      return res.status(404).json({ success: false, error: 'Recipient not found' });
    }

    if (recipient.id === req.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot transfer to yourself' });
    }

    // Get or create recipient wallet
    let recipientWallet = await prisma.wallet.findUnique({
      where: { userId: recipient.id }
    });

    if (!recipientWallet) {
      recipientWallet = await prisma.wallet.create({
        data: { userId: recipient.id, balance: 0 }
      });
    }

    // Atomic transfer with transaction logs
    await prisma.$transaction([
      prisma.wallet.update({
        where: { id: senderWallet.id },
        data: { balance: { decrement: amount } }
      }),
      prisma.wallet.update({
        where: { id: recipientWallet.id },
        data: { balance: { increment: amount } }
      }),
      prisma.walletTransaction.create({
        data: {
          walletId: senderWallet.id,
          type: 'DEBIT',
          amount,
          description: `Transfer to ${recipient.fullName}${note ? ` — ${note}` : ''}`
        }
      }),
      prisma.walletTransaction.create({
        data: {
          walletId: recipientWallet.id,
          type: 'CREDIT',
          amount,
          description: `Transfer from ${req.user.fullName || req.user.email}${note ? ` — ${note}` : ''}`
        }
      })
    ]);

    res.json({
      success: true,
      message: `₹${amount} transferred to ${recipient.fullName}`,
      data: {
        amount,
        recipient: { name: recipient.fullName, email: recipient.email }
      }
    });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ success: false, error: 'Failed to transfer funds' });
  }
};

/**
 * GET /api/wallet/all-transactions (Admin)
 */
export const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        include: {
          wallet: {
            include: {
              user: { select: { id: true, fullName: true, email: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.walletTransaction.count()
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
      }
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
};

/**
 * GET /api/wallet/analytics (Admin)
 */
export const getWalletAnalytics = async (req, res) => {
  try {
    const [totalWallets, totalBalance, activeWallets] = await Promise.all([
      prisma.wallet.count(),
      prisma.wallet.aggregate({ _sum: { balance: true } }),
      prisma.wallet.count({ where: { balance: { gt: 0 } } })
    ]);

    res.json({
      success: true,
      data: {
        totalWallets,
        totalBalance: totalBalance._sum.balance || 0,
        activeWallets,
        averageBalance: totalWallets > 0 ? (totalBalance._sum.balance || 0) / totalWallets : 0
      }
    });
  } catch (error) {
    console.error('Get wallet analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
};


