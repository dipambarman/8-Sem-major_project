import { prisma } from '../models/index.js';

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
    });
  }
}

export default ReservationSocket;
