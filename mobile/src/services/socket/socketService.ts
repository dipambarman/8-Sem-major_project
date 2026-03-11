import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = (token: string) => {
  const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000';
  
  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('🔌 Connected to server:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Disconnected from server:', reason);
  });

  socket.on('orderUpdate', (data) => {
    console.log('📦 Order update received:', data);
    // Handle order updates
  });

  socket.on('walletUpdate', (data) => {
    console.log('💰 Wallet update received:', data);
    // Handle wallet updates
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinOrderRoom = (orderId: string) => {
  if (socket) {
    socket.emit('joinOrderRoom', orderId);
  }
};

export const leaveOrderRoom = (orderId: string) => {
  if (socket) {
    socket.emit('leaveOrderRoom', orderId);
  }
};
