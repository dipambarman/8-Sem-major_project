/**
 * @file test-connection.mjs
 * @description Tests PostgreSQL connection using native pg Client or Prisma client based on CLI option.
 */

import { Client } from 'pg';
import { testConnection as prismaTestConnection, disconnectDB } from './src/utils/database.js';

/**
 * Tests PostgreSQL connection using native pg Client.
 * Connection details are read from DATABASE_URL environment variable.
 * @returns {Promise<void>}
 */
async function testNativePgConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔌 Connecting to PostgreSQL (native pg)...');
    await client.connect();
    console.log('✅ Connected successfully!');

    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('📊 Database Info:');
    console.log('Current Time:', result.rows[0].current_time);
    console.log('PostgreSQL Version:', result.rows[0].pg_version.split(' ')[0]);

    const testQuery = await client.query('SELECT 1 + 1 as result');
    console.log('🧮 Test calculation (1+1):', testQuery.rows[0].result);
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error message:', error.message || error);
    console.error('Error code:', error.code);

    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Solution: Make sure PostgreSQL service is running');
    } else if (error.code === '28P01') {
      console.log('💡 Solution: Check username/password in .env file');
    } else if (error.code === '3D000') {
      console.log('💡 Solution: Database does not exist, create it first');
    }
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Connection closed (native pg)');
  }
}

/**
 * Runs the test based on CLI argument or defaults to both tests.
 * Supports 'native' or 'prisma' as first argument to test respective connection.
 * @returns {Promise<void>}
 */
async function runTests() {
  const testType = process.argv[2] ? process.argv[2].toLowerCase() : 'both';

  console.log('🚀 Starting PostgreSQL Connection Test...\n');

  try {
    if (testType === 'native') {
      await testNativePgConnection();
    } else if (testType === 'prisma') {
      await prismaTestConnection();
    } else {
      // Run both tests sequentially
      await testNativePgConnection();
      await prismaTestConnection();
    }
    console.log('\n🎉 Test completed successfully!');
  } catch (error) {
    console.error('\n💥 Test failed:', error.message || error);
} finally {
  process.exit(0);
}
}

runTests();
