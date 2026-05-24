
/**
 * Forever AI - Prisma 数据库客户端
 * 
 * 注意：此文件在没有初始化 Prisma 时作为占位符
 */

import { logger } from '../logger';

// 占位符 Prisma 客户端
export class FakePrismaClient {
  async $connect() {
    logger.info('database', 'Prisma client (placeholder) connected');
  }
  
  async $disconnect() {
    logger.info('database', 'Prisma client (placeholder) disconnected');
  }
}

export const prisma = new FakePrismaClient();

export async function initializeDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('database', 'Database (placeholder) initialized');
  } catch (error) {
    logger.error('database', 'Failed to initialize database', { error });
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('database', 'Database closed');
  } catch (error) {
    logger.error('database', 'Failed to close database', { error });
    throw error;
  }
}

export async function resetDatabase(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    logger.warn('database', 'Reset database only allowed in non-production environments');
    return;
  }
  logger.info('database', 'Database reset (placeholder)');
}

export default prisma;

