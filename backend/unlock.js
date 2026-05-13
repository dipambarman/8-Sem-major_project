import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const provider = prisma._activeProvider;
    
    if (provider === 'postgresql') {
      const result = await prisma.$executeRaw`
        SELECT pg_terminate_backend(pid) 
        FROM pg_stat_activity 
        WHERE datname = current_database() 
          AND pid <> pg_backend_pid();
      `;
      console.log('Successfully killed other connections:', result);
    } else {
      console.log('Not using PostgreSQL, skipping connection termination.');
    }
  } catch (e) {
    console.error('Failed to kill connections:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
