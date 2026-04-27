import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { testConnection } from './src/utils/database.js';
import routes from './src/routes/index.js';
import ErrorMiddleware from './src/middleware/errorMiddleware.js';
import SecurityMiddleware from './src/middleware/securityMiddleware.js';
import SocketManager from './src/sockets/index.js';
import { SOCKET_CONFIG } from './src/config/socket.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, SOCKET_CONFIG);

// Initialize Socket Manager
const socketManager = new SocketManager(io);

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security: rate limiting, input sanitization, request logging
app.use(SecurityMiddleware.apiLimiter);
app.use(SecurityMiddleware.sanitizeInput);
app.use(SecurityMiddleware.requestLogger);

// ─── ROUTES ───────────────────────────────────────────────────────────────

app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Canteen API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ─── ERROR HANDLING ───────────────────────────────────────────────────────

app.use(ErrorMiddleware.notFoundHandler);
app.use(ErrorMiddleware.globalErrorHandler);

// ─── START SERVER ─────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await testConnection();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.warn('⚠️ Database connection failed — server will start anyway');
    console.warn('⚠️ Database features will not work until connection is restored');
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Smart Canteen Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📱 CORS: Enabled for all origins`);
    console.log(`🔒 Security: Rate limiting, input sanitization, request logging enabled`);
    console.log(`📋 Routes: /api/auth, /api/menu, /api/orders, /api/wallet, /api/smartpass, ...`);
  });
}

startServer();

export { app, server, io, socketManager };
