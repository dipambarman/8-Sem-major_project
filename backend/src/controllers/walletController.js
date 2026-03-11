import prisma from '../../prisma/prisma.config.js';
import { createRazorpayOrder, verifyPayment } from '../services/paymentService.js';

// Get wallet balance
export const getWalletBalance = async (req, res) => {
  try {
    const wallet = await prisma.wallet.findFirst({
      where: { userId: req.user.id },
      include: {
        User: {
          select: {
            id: true,
            fullName: true,
            userType: true
          }
        }
      }
    });

    if (!wallet) {
      // Auto-create wallet if it doesn't exist
      const newWallet = await prisma.wallet.create({
        data: {
          userId: req.user.id,
          balance: 0
        }
      });

      return res.json({
        success: true,
        data: newWallet
      });
    }

    res.json({
      success: true,
      data: wallet
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wallet'
    });
  }
};

// Top up wallet
export const topUpWallet = async (req, res) => {
  try {
    const { amount, paymentId, orderId, signature } = req.body;

    // Verify Razorpay payment
    const isPaymentValid = verifyPayment(paymentId, orderId, signature);
    if (!isPaymentValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
    }

    // Find or create wallet
    let wallet = await prisma.wallet.findFirst({
      where: { userId: req.user.id }
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: req.user.id,
          balance: 0
        }
      });
    }

    // Calculate bonus based on amount
    const bonusAmount = calculateBonus(amount);
    const totalCredit = amount + bonusAmount;

    // Update wallet balance
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          increment: totalCredit
        }
      }
    });

    res.json({
      success: true,
      data: {
        wallet: updatedWallet,
        creditedAmount: totalCredit,
        bonusAmount: bonusAmount
      },
      message: `Wallet topped up successfully! ₹${amount} + ₹${bonusAmount} bonus`
    });
  } catch (error) {
    console.error('Top-up error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to top up wallet'
    });
  }
};

// Get transaction history (simplified - uses Order/Payment records)
export const getTransactionHistory = async (req, res) => {
  try {
    const wallet = await prisma.wallet.findFirst({
      where: { userId: req.user.id }
    });

    if (!wallet) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Get orders as transaction history
    const orders = await prisma.order.findMany({
      where: { userid: req.user.id },
      include: {
        MenuItem: {
          select: {
            name: true
          }
        },
        Payment: true
      },
      orderBy: {
        orderedat: 'desc'
      },
      take: 50
    });

    const transactions = orders.map(order => ({
      id: order.id,
      type: 'DEBIT',
      amount: order.totalprice,
      description: `Order - ${order.MenuItem.name}`,
      status: order.status,
      createdAt: order.orderedat
    }));

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions'
    });
  }
};

// Transfer funds between wallets
export const transferFunds = async (req, res) => {
  try {
    const { recipientEmail, amount, note } = req.body;

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    // Get sender wallet
    const senderWallet = await prisma.wallet.findFirst({
      where: { userId: req.user.id }
    });

    if (!senderWallet || senderWallet.balance < amount) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance'
      });
    }

    // Find recipient
    const recipient = await prisma.user.findUnique({
      where: { email: recipientEmail }
    });

    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: 'Recipient not found'
      });
    }

    // Get or create recipient wallet
    let recipientWallet = await prisma.wallet.findFirst({
      where: { userId: recipient.id }
    });

    if (!recipientWallet) {
      recipientWallet = await prisma.wallet.create({
        data: {
          userId: recipient.id,
          balance: 0
        }
      });
    }

    // Perform transfer
    await prisma.$transaction([
      prisma.wallet.update({
        where: { id: senderWallet.id },
        data: { balance: { decrement: amount } }
      }),
      prisma.wallet.update({
        where: { id: recipientWallet.id },
        data: { balance: { increment: amount } }
      })
    ]);

    res.json({
      success: true,
      message: `₹${amount} transferred to ${recipient.fullName}`,
      data: {
        amount,
        recipient: {
          name: recipient.fullName,
          email: recipient.email
        }
      }
    });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to transfer funds'
    });
  }
};

// Admin: Get all transactions
export const getAllTransactions = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        User: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        MenuItem: {
          select: {
            name: true
          }
        },
        Payment: true
      },
      orderBy: {
        orderedat: 'desc'
      },
      take: 100
    });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions'
    });
  }
};

// Admin: Get wallet analytics
export const getWalletAnalytics = async (req, res) => {
  try {
    const [totalWallets, totalBalance, activeWallets] = await Promise.all([
      prisma.wallet.count(),
      prisma.wallet.aggregate({
        _sum: { balance: true }
      }),
      prisma.wallet.count({
        where: { balance: { gt: 0 } }
      })
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
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
};

// Helper function
const calculateBonus = (amount) => {
  if (amount >= 999) return 150;
  if (amount >= 699) return 70;
  if (amount >= 399) return 35;
  if (amount >= 199) return 15;
  return 0;
};
