import { NextResponse } from 'next/server';
import { AppError, ValidationError } from '@/lib/errors';
import logger from '@/lib/logger';
import { Prisma } from '@prisma/client';

export function apiErrorHandler(error: unknown, context: string) {
  if (error instanceof AppError) {
    logger.warn(`AppError in ${context}: ${error.message}`, { statusCode: error.statusCode });
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  if (error instanceof ValidationError) {
    logger.warn(`ValidationError in ${context}: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error(`Database error in ${context}: ${error.message}`, { code: error.code });
    return NextResponse.json({ error: 'Database operation failed' }, { status: 500 });
  }
  logger.error(`Unexpected error in ${context}:`, error);
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}
