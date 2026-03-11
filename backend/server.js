import 'dotenv/config'; // Load env vars before anything else
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { testConnection } from './src/utils/database.js';
import routes from './src/routes/index.js';

import SocketManager from './src/sockets/index.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  }
});

// Initialize Socket Manager
const socketManager = new SocketManager(io);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Canteen API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test database endpoint
app.get('/test-db', async (req, res) => {
  try {
    await testConnection();
    res.json({
      success: true,
      message: 'Neon database connection successful!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      message: error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;

async function startServer() {
  // ✅ Try to connect to database but don't crash if it fails
  try {
    await testConnection();
    console.log('✅ Neon database connected successfully');
  } catch (error) {
    console.warn('⚠️ Database connection failed - server will start anyway');
    console.warn('⚠️ Database features will not work until connection is restored');
  }

  // ✅ Start server regardless of database status
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Smart Canteen Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`📱 CORS: Enabled for all origins (development mode)`);
  });
}

startServer();

export { app, server, io, socketManager };
