import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Unlocking advisory lock 72707369...');
    await prisma.$executeRaw`SELECT pg_advisory_unlock(72707369);`;
    
    console.log('Dropping public schema...');
    await prisma.$executeRaw`DROP SCHEMA IF EXISTS public CASCADE;`;
    
    console.log('Creating public schema...');
    await prisma.$executeRaw`CREATE SCHEMA public;`;
    
    console.log('Schema reset successfully.');
  } catch (e) {
    console.error('Failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
