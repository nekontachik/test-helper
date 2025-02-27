import { PrismaClient } from '@prisma/client';
import logger from './logger';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function getPrismaClient(): PrismaClient {
  try {
    const client = new PrismaClient({
      log: process.env.LOG_LEVEL === 'debug' ? ['query', 'error', 'warn'] : ['error'],
    });
    
    // Test the connection
    client.$connect();
    
    return client;
  } catch (error) {
    logger.error('Failed to initialize Prisma client:', error);
    throw new Error('Database connection failed');
  }
}

export const prisma = global.prisma || getPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
