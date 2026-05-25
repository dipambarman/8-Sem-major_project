import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { testConnection } from '../src/utils/database.js';
import routes from '../src/routes/index.js';
import ErrorMiddleware from '../src/middleware/errorMiddleware.js';
import SecurityMiddleware from '../src/middleware/securityMiddleware.js';

const app = express();

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────

// CORS MUST be first - before helmet and other middleware
app.use((req, res, next) => {
  const origin = process.env.FRONTEND_URL || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Bypass-Tunnel-Reminder');
  res.header('Access-Control-Expose-Headers', 'Content-Length, X-Total-Count');
  res.header('Access-Control-Max-Age', '3600');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Bypass-Tunnel-Reminder'],
  exposedHeaders: ['Content-Length', 'X-Total-Count'],
  maxAge: 3600
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
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
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// ─── ERROR HANDLING ───────────────────────────────────────────────────────

app.use(ErrorMiddleware.notFoundHandler);
app.use(ErrorMiddleware.globalErrorHandler);

// ─── DATABASE CONNECTION CHECK ───────────────────────────────────────────

testConnection().catch(error => {
  console.warn('⚠️ Database connection warning:', error.message);
});

export default app;
