import { PrismaClient } from '@prisma/client';

/**
 * Singleton PrismaClient instance.
 * All modules MUST import prisma from this file to avoid multiple connections.
 */
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

/**
 * Delay helper function for retries.
 * @param {number} ms Milliseconds to delay.
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Tests the database connection with retries.
 * @param {number} retries Number of retry attempts (default 3).
 * @param {number} timeout Timeout per attempt in ms (default 3000).
 * @returns {Promise<boolean>}
 */
export const testConnection = async (retries = 3, timeout = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔌 Testing database connection... (Attempt ${attempt}/${retries})`);

      const dbCheckPromise = (async () => {
        await prisma.$connect();
        const [result] = await prisma.$queryRaw`SELECT 1 as connection_test`;
        return result;
      })();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection attempt timed out')), timeout)
      );

      const result = await Promise.race([dbCheckPromise, timeoutPromise]);
      console.log('✅ Connected to database successfully');
      console.log('📊 Connection test result:', result);
      return true;
    } catch (error) {
      console.error(`❌ Connection failed (Attempt ${attempt}):`, error.message || error);
      if (attempt < retries) {
        console.log('⏳ Retrying connection...');
        await delay(1000);
      } else {
        console.error('❌ All connection attempts failed.');
        throw error;
      }
    }
  }
};

/**
 * Gracefully disconnects Prisma client from the database.
 */
export const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from database');
  } catch (error) {
    console.error('❌ Error during database disconnect:', error.message || error);
  }
};

// Setup graceful shutdown handlers
const setupGracefulShutdown = () => {
  const gracefulShutdown = async () => {
    try {
      await disconnectDB();
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
};

setupGracefulShutdown();

export default prisma;
