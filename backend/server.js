import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import prisma, { testConnection } from './src/utils/database.js';
import routes from './src/routes/index.js';
import ErrorMiddleware from './src/middleware/errorMiddleware.js';
import SecurityMiddleware from './src/middleware/securityMiddleware.js';
import SocketManager from './src/sockets/index.js';
import { SOCKET_CONFIG } from './src/config/socket.js';

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

const io = new Server(server, SOCKET_CONFIG);

// Initialize Socket Manager
const socketManager = new SocketManager(io);

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────

// CORS MUST be first - before helmet and other middleware
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Bypass-Tunnel-Reminder');
  res.header('Access-Control-Expose-Headers', 'Content-Length, X-Total-Count');
  res.header('Access-Control-Max-Age', '3600');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Bypass-Tunnel-Reminder'],
  exposedHeaders: ['Content-Length', 'X-Total-Count'],
  maxAge: 3600
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security: rate limiting, input sanitization, request logging
app.use(SecurityMiddleware.apiLimiter);
app.use(SecurityMiddleware.sanitizeInput);
app.use(SecurityMiddleware.requestLogger);

// ─── ROUTES ───────────────────────────────────────────────────────────────

app.use('/api', routes);

// API-level health check (accessible from mobile as /api/health)
app.get('/api/health', async (req, res) => {
  let dbStatus = 'unknown';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }
  res.json({
    success: true,
    message: 'Smart Canteen API is running',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Smart Canteen API',
    docs: 'Append /api to the URL to access endpoints',
    health: 'Append /health to check server status'
  });
});

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

export default app;
export { app, server, io, socketManager };
