import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('DATABASE_URL loaded:', process.env.DATABASE_URL);

const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
  // Note: remove datasource override here due to Prisma v7+ deprecation, use DATABASE_URL env var instead
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
