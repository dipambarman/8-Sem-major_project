import prisma from '../../prisma/prisma.config.js';

/**
 * Delay helper function for retries.
 * @param {number} ms Milliseconds to delay.
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Tests the Neon database connection and logs details.
 * Includes configurable retries and timeout.
 * @param {number} retries Number of retry attempts (default 3).
 * @param {number} timeout Timeout per attempt in ms (default 3000).
 * @returns {Promise<boolean>} Returns true if connection succeeds.
 * @throws Will throw error if connection fails after retries.
 */
export const testConnection = async (retries = 3, timeout = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔌 Testing Neon database connection... (Attempt ${attempt}/${retries})`);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection attempt timed out')), timeout)
      );

      // Race connect promise against timeout promise
      await Promise.race([prisma.$connect(), timeoutPromise]);

      // Test query to get server version and current time
      const [result] = await prisma.$queryRaw`SELECT version(), now() as current_time`;
      console.log('✅ Connected to Neon PostgreSQL successfully');
      console.log('📊 Database info:', result);
      return true;
    } catch (error) {
      console.error(`❌ Failed to connect to Neon database (Attempt ${attempt}):`, error.message || error);
      if (attempt < retries) {
        console.log('⏳ Retrying connection...');
        await delay(1000); // wait 1 second before retry
      } else {
        console.error('❌ All connection attempts failed.');
        throw error;
      }
    }
  }
};

/**
 * Gracefully disconnects Prisma client from the database.
 * @returns {Promise<void>}
 */
export const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from database');
  } catch (error) {
    console.error('❌ Error during database disconnect:', error.message || error);
  }
};

/**
 * Utility method to setup graceful shutdown on process signals.
 */
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

// Initialize graceful shutdown handlers
setupGracefulShutdown();

export default prisma;
