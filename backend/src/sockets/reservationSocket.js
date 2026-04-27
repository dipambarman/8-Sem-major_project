import prisma from '../utils/database.js';

class ReservationSocket {
  constructor(io) {
    this.io = io;
    this.setupReservationEventHandlers();
  }

  setupReservationEventHandlers() {
    this.io.on('connection', (socket) => {
      socket.on('joinReservationRoom', (reservationId) => {
        socket.join(`reservation_${reservationId}`);
      });
      socket.on('leaveReservationRoom', (reservationId) => {
        socket.leave(`reservation_${reservationId}`);
      });

      // Handle reservation status updates
      socket.on('updateReservationStatus', async (data) => {
        try {
          const { reservationId, status } = data;

          this.io.to(`reservation_${reservationId}`).emit('reservationStatusUpdate', {
            reservationId,
            status,
            timestamp: new Date(),
          });
        } catch (error) {
          console.error('Reservation status update error:', error);
        }
      });
    });
  }
}

export default ReservationSocket;
