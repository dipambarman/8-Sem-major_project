/**
 * @file test-neon-connection.js
 * @description Tests Neon and Prisma database connection using utils/database.js Prisma client.
 */

import { testConnection, disconnectDB } from './src/utils/database.js';

/**
 * Tests Neon + Prisma setup connection.
 */
async function testNeonSetup() {
  try {
    console.log('🧪 Testing Neon + Prisma setup...');

    // Test connection using utility from database.js
    await testConnection();

    // Additional sample queries can be added here, e.g., count users, vendors, etc.
    console.log('✅ Connected to Neon successfully');
  } catch (error) {
    console.error('❌ Neon setup test failed:', error.message || error);
  } finally {
    await disconnectDB();
    console.log('🔌 Disconnected from Neon database');
  }
}

testNeonSetup();
