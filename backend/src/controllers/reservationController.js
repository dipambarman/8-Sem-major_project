import prisma from '../utils/database.js';

class ReservationController {
  // Create new reservation
  async createReservation(req, res) {
    try {
      const {
        reservationTime,
        partySize,
        diningArea,
        specialRequests,
        contactPhone,
        vendorId
      } = req.body;

      const userId = req.user.id;

      // Validate reservation time (must be in future)
      const reservationDate = new Date(reservationTime);
      const now = new Date();
      if (reservationDate <= now) {
        return res.status(400).json({
          success: false,
          error: 'Reservation time must be in the future'
        });
      }

      // Check if vendor exists and is active
      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId }
      });

      if (!vendor) {
        return res.status(404).json({
          success: false,
          error: 'Vendor not found'
        });
      }

      // Check for existing reservations at same time/area (basic availability)
      const timeSlotStart = new Date(reservationDate.getTime() - 30 * 60000); // 30 min before
      const timeSlotEnd = new Date(reservationDate.getTime() + 90 * 60000); // 90 min after

      const existingReservations = await prisma.reservation.count({
        where: {
          vendorId,
          diningArea,
          reservationTime: {
            gte: timeSlotStart,
            lte: timeSlotEnd
          },
          status: {
            in: ['PENDING', 'CONFIRMED']
          }
        }
      });

      // Simple capacity check (assuming 10 tables per area)
      const maxCapacity = 10;
      if (existingReservations >= maxCapacity) {
        return res.status(409).json({
          success: false,
          error: 'No tables available at this time. Please choose another slot.'
        });
      }

      // Create reservation
      const reservation = await prisma.reservation.create({
        data: {
          userId,
          vendorId,
          reservationTime: reservationDate,
          partySize,
          diningArea,
          specialRequests,
          contactPhone: contactPhone || req.user.phone,
          status: 'PENDING'
        },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, phone: true }
          },
          vendor: {
            select: { id: true, name: true }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: reservation,
        message: 'Reservation created successfully'
      });

    } catch (error) {
      console.error('Create reservation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create reservation'
      });
    }
  }

  // Get vendor reservations
  async getVendorReservations(req, res) {
    try {
      const vendorId = req.vendor.id;
      const { status, date, diningArea } = req.query;

      const whereClause = { vendorId };
      if (status) whereClause.status = status.toUpperCase();
      if (diningArea) whereClause.diningArea = diningArea;

      if (date) {
        const startDate = new Date(date);
        const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        whereClause.reservationTime = {
          gte: startDate,
          lte: endDate
        };
      }

      const reservations = await prisma.reservation.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, fullName: true, email: true, phone: true }
          }
        },
        orderBy: { reservationTime: 'asc' }
      });

      res.json({
        success: true,
        data: reservations
      });

    } catch (error) {
      console.error('Get vendor reservations error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch reservations'
      });
    }
  }

  // Update reservation status (vendor)
  async updateReservationStatus(req, res) {
    try {
      const { reservationId } = req.params;
      const { status, tableNumber } = req.body;
      const vendorId = req.vendor.id;

      const reservation = await prisma.reservation.findFirst({
        where: { id: reservationId, vendorId }
      });

      if (!reservation) {
        return res.status(404).json({
          success: false,
          error: 'Reservation not found'
        });
      }

      // Validate status transitions
      const validTransitions = {
        PENDING: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
        CANCELLED: [],
        COMPLETED: [],
        NO_SHOW: []
      };

      if (!validTransitions[reservation.status].includes(status.toUpperCase())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status transition'
        });
      }

      // Update reservation
      const updateData = { status: status.toUpperCase() };
      if (tableNumber) updateData.tableNumber = tableNumber;
      if (status.toUpperCase() === 'COMPLETED') updateData.actualCheckOutTime = new Date();
      if (status.toUpperCase() === 'CONFIRMED') updateData.actualCheckInTime = new Date();

      const updatedReservation = await prisma.reservation.update({
        where: { id: reservationId },
        data: updateData
      });

      res.json({
        success: true,
        data: updatedReservation,
        message: 'Reservation updated successfully'
      });

    } catch (error) {
      console.error('Update reservation status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update reservation'
      });
    }
  }

  // Get user reservations
  async getUserReservations(req, res) {
    try {
      const userId = req.user.id;
      const { status } = req.query;

      const whereClause = { userId };
      if (status) whereClause.status = status.toUpperCase();

      const reservations = await prisma.reservation.findMany({
        where: whereClause,
        include: {
          vendor: {
            select: { id: true, name: true, address: true, phone: true }
          }
        },
        orderBy: { reservationTime: 'desc' }
      });

      res.json({
        success: true,
        data: reservations
      });

    } catch (error) {
      console.error('Get user reservations error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch reservations'
      });
    }
  }

  // Cancel reservation (user)
  async cancelReservation(req, res) {
    try {
      const { reservationId } = req.params;
      const { cancelReason } = req.body;
      const userId = req.user.id;

      const reservation = await prisma.reservation.findFirst({
        where: { id: reservationId, userId }
      });

      if (!reservation) {
        return res.status(404).json({
          success: false,
          error: 'Reservation not found'
        });
      }

      // Check if reservation can be cancelled (more than 30 minutes remaining)
      const now = new Date();
      const reservationTime = new Date(reservation.reservationTime);
      const timeDiff = reservationTime.getTime() - now.getTime();
      const thirtyMinutes = 30 * 60 * 1000;

      if (timeDiff < thirtyMinutes) {
        return res.status(400).json({
          success: false,
          error: 'Reservation cannot be cancelled (less than 30 minutes remaining)'
        });
      }

      const updatedReservation = await prisma.reservation.update({
        where: { id: reservationId },
        data: {
          status: 'CANCELLED',
          cancelReason
        }
      });

      res.json({
        success: true,
        data: updatedReservation,
        message: 'Reservation cancelled successfully'
      });

    } catch (error) {
      console.error('Cancel reservation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel reservation'
      });
    }
  }

  // Check availability
  async checkAvailability(req, res) {
    try {
      const { vendorId } = req.params;
      const { date, partySize, diningArea } = req.query;

      const checkDate = date ? new Date(date) : new Date();
      const startTime = new Date(checkDate);
      startTime.setHours(0, 0, 0, 0);
      const endTime = new Date(checkDate);
      endTime.setHours(23, 59, 59, 999);

      const reservations = await prisma.reservation.findMany({
        where: {
          vendorId,
          reservationTime: {
            gte: startTime,
            lte: endTime
          },
          status: {
            in: ['PENDING', 'CONFIRMED']
          },
          diningArea: diningArea || undefined
        },
        select: {
          reservationTime: true,
          partySize: true,
          diningArea: true
        }
      });

      // Generate available time slots (assuming 11 AM to 10 PM, 1-hour slots)
      const availableSlots = [];
      for (let hour = 11; hour <= 22; hour++) {
        const slotTime = new Date(checkDate);
        slotTime.setHours(hour, 0, 0, 0);

        // Check if this slot has capacity
        const slotReservations = reservations.filter(r => {
          const resTime = new Date(r.reservationTime);
          return Math.abs(resTime.getTime() - slotTime.getTime()) < 60 * 60 * 1000; // Within 1 hour
        });

        const totalPartySize = slotReservations.reduce((sum, r) => sum + r.partySize, 0);
        const maxCapacity = 50; // Assuming max 50 people per hour

        if (totalPartySize + (partySize || 1) <= maxCapacity) {
          availableSlots.push({
            time: slotTime.toISOString(),
            available: true,
            remainingCapacity: maxCapacity - totalPartySize
          });
        }
      }

      res.json({
        success: true,
        data: {
          date: checkDate.toISOString(),
          availableSlots
        }
      });

    } catch (error) {
      console.error('Check availability error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check availability'
      });
    }
  }
}

export default new ReservationController();
