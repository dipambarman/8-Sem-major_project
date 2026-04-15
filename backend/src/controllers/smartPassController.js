import prisma from '../utils/database.js';
import qrCodeService from '../services/qrCodeService.js';
import crypto from 'crypto';

/**
 * SmartPass Controller
 * Handles premium membership lifecycle: join, status, card, benefits, admin management.
 */
class SmartPassController {
  /**
   * POST /api/smartpass/join
   * User applies for a SmartPass membership.
   */
  async joinSmartPass(req, res) {
    try {
      const userId = req.user.id;
      const { tier = 'SILVER' } = req.body;

      // Check if user already has a SmartPass
      const existing = await prisma.smartPass.findUnique({
        where: { userId }
      });

      if (existing) {
        if (existing.status === 'ACTIVE') {
          return res.status(409).json({
            success: false,
            error: 'You already have an active SmartPass membership.'
          });
        }

        if (existing.status === 'PENDING') {
          return res.status(409).json({
            success: false,
            error: 'Your SmartPass application is already under review.'
          });
        }
      }

      // Determine discount based on tier
      const discountMap = { SILVER: 5, GOLD: 10, PLATINUM: 15 };
      const discountPercent = discountMap[tier] || 5;

      // Generate a unique card number
      const cardNumber = `SP-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      const smartPass = await prisma.smartPass.upsert({
        where: { userId },
        update: {
          tier,
          status: 'PENDING',
          discountPercent,
          cardNumber
        },
        create: {
          userId,
          tier,
          status: 'PENDING',
          discountPercent,
          cardNumber
        }
      });

      res.status(201).json({
        success: true,
        data: smartPass,
        message: 'SmartPass application submitted! Awaiting admin approval.'
      });
    } catch (error) {
      console.error('Join SmartPass error:', error);
      res.status(500).json({ success: false, error: 'Failed to apply for SmartPass' });
    }
  }

  /**
   * GET /api/smartpass/status
   * Get current user's SmartPass membership status.
   */
  async getStatus(req, res) {
    try {
      const userId = req.user.id;

      const smartPass = await prisma.smartPass.findUnique({
        where: { userId }
      });

      if (!smartPass) {
        return res.json({
          success: true,
          data: null,
          message: 'No SmartPass membership found. Apply to get started!'
        });
      }

      res.json({
        success: true,
        data: smartPass
      });
    } catch (error) {
      console.error('Get SmartPass status error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch SmartPass status' });
    }
  }

  /**
   * GET /api/smartpass/card
   * Get virtual SmartPass card with QR code.
   */
  async getCard(req, res) {
    try {
      const userId = req.user.id;

      const smartPass = await prisma.smartPass.findUnique({
        where: { userId },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, phone: true }
          }
        }
      });

      if (!smartPass || smartPass.status !== 'ACTIVE') {
        return res.status(403).json({
          success: false,
          error: 'Active SmartPass required to access card.'
        });
      }

      // Generate QR code containing card data
      const qrData = JSON.stringify({
        type: 'smartpass',
        cardNumber: smartPass.cardNumber,
        userId: smartPass.userId,
        tier: smartPass.tier,
        timestamp: new Date().toISOString()
      });

      const qrCode = await qrCodeService.generateOrderQR(smartPass.id, smartPass.cardNumber);

      res.json({
        success: true,
        data: {
          cardNumber: smartPass.cardNumber,
          tier: smartPass.tier,
          discountPercent: smartPass.discountPercent,
          expiresAt: smartPass.expiresAt,
          holder: smartPass.user.fullName,
          qrCode
        }
      });
    } catch (error) {
      console.error('Get SmartPass card error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch card details' });
    }
  }

  /**
   * GET /api/smartpass/benefits
   * Get current discount rates and perks per tier.
   */
  async getBenefits(req, res) {
    try {
      const benefits = {
        SILVER: {
          discountPercent: 5,
          perks: [
            'Flat 5% discount on all orders',
            'Priority order queue',
            'Exclusive menu item access'
          ]
        },
        GOLD: {
          discountPercent: 10,
          perks: [
            'Flat 10% discount on all orders',
            'Priority order queue',
            'Exclusive menu item access',
            'Free delivery on orders above ₹200',
            'Birthday special offer'
          ]
        },
        PLATINUM: {
          discountPercent: 15,
          perks: [
            'Flat 15% discount on all orders',
            'Top priority order queue',
            'All exclusive menu items',
            'Free delivery on all orders',
            'Birthday & anniversary special offers',
            'Dedicated customer support',
            'Higher wallet top-up bonuses'
          ]
        }
      };

      res.json({
        success: true,
        data: benefits
      });
    } catch (error) {
      console.error('Get benefits error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch benefits' });
    }
  }

  /**
   * POST /api/smartpass/link-card
   * Link a physical card (NFC/RFID serial) to user's SmartPass. Admin only.
   */
  async linkPhysicalCard(req, res) {
    try {
      const { userId, physicalCardId } = req.body;

      const smartPass = await prisma.smartPass.findUnique({
        where: { userId: parseInt(userId) }
      });

      if (!smartPass) {
        return res.status(404).json({
          success: false,
          error: 'SmartPass not found for this user'
        });
      }

      const updated = await prisma.smartPass.update({
        where: { userId: parseInt(userId) },
        data: { cardNumber: physicalCardId }
      });

      res.json({
        success: true,
        data: updated,
        message: 'Physical card linked successfully'
      });
    } catch (error) {
      console.error('Link physical card error:', error);
      res.status(500).json({ success: false, error: 'Failed to link card' });
    }
  }

  // ─── ADMIN ENDPOINTS ────────────────────────────────────────────────

  /**
   * GET /api/smartpass/admin/members
   * List all SmartPass applications/members.
   */
  async getAllMembers(req, res) {
    try {
      const { status, tier, page = 1, limit = 20 } = req.query;

      const where = {};
      if (status) where.status = status.toUpperCase();
      if (tier) where.tier = tier.toUpperCase();

      const [members, total] = await Promise.all([
        prisma.smartPass.findMany({
          where,
          include: {
            user: {
              select: { id: true, fullName: true, email: true, phone: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: (parseInt(page) - 1) * parseInt(limit),
          take: parseInt(limit)
        }),
        prisma.smartPass.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          members,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get all members error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch members' });
    }
  }

  /**
   * POST /api/smartpass/admin/approve/:smartPassId
   * Approve or reject a SmartPass application.
   */
  async approveApplication(req, res) {
    try {
      const { smartPassId } = req.params;
      const { action } = req.body; // 'approve' or 'reject'

      const smartPass = await prisma.smartPass.findUnique({
        where: { id: parseInt(smartPassId) }
      });

      if (!smartPass) {
        return res.status(404).json({ success: false, error: 'SmartPass not found' });
      }

      if (smartPass.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          error: 'Only pending applications can be approved/rejected'
        });
      }

      const now = new Date();
      const expiresAt = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()); // 1 year

      const updateData = action === 'approve'
        ? { status: 'ACTIVE', activatedAt: now, expiresAt }
        : { status: 'CANCELLED' };

      const updated = await prisma.smartPass.update({
        where: { id: parseInt(smartPassId) },
        data: updateData,
        include: {
          user: { select: { id: true, fullName: true, email: true } }
        }
      });

      // If approved, upgrade user type to PREMIUM
      if (action === 'approve') {
        await prisma.user.update({
          where: { id: smartPass.userId },
          data: { userType: 'PREMIUM' }
        });

        // Send notification to user
        await prisma.notification.create({
          data: {
            userId: smartPass.userId,
            title: '🎉 SmartPass Approved!',
            message: `Your ${smartPass.tier} SmartPass has been activated. Enjoy ${smartPass.discountPercent}% off on all orders!`,
            type: 'smartpass'
          }
        });
      }

      res.json({
        success: true,
        data: updated,
        message: `SmartPass ${action === 'approve' ? 'approved' : 'rejected'} successfully`
      });
    } catch (error) {
      console.error('Approve application error:', error);
      res.status(500).json({ success: false, error: 'Failed to process application' });
    }
  }

  /**
   * GET /api/smartpass/admin/analytics
   * SmartPass usage statistics.
   */
  async getAnalytics(req, res) {
    try {
      const [totalMembers, byTier, byStatus, totalDiscount] = await Promise.all([
        prisma.smartPass.count(),
        prisma.smartPass.groupBy({
          by: ['tier'],
          _count: { id: true }
        }),
        prisma.smartPass.groupBy({
          by: ['status'],
          _count: { id: true }
        }),
        prisma.order.aggregate({
          _sum: { smartPassDiscount: true },
          where: { smartPassDiscount: { gt: 0 } }
        })
      ]);

      res.json({
        success: true,
        data: {
          totalMembers,
          membersByTier: byTier.map(t => ({ tier: t.tier, count: t._count.id })),
          membersByStatus: byStatus.map(s => ({ status: s.status, count: s._count.id })),
          totalDiscountGiven: totalDiscount._sum.smartPassDiscount || 0
        }
      });
    } catch (error) {
      console.error('SmartPass analytics error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
    }
  }
}

export default new SmartPassController();
