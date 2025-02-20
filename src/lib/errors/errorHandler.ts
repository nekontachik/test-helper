import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { BaseError } from './BaseError';
import { logger } from '@/lib/utils/logger';

export function handleApiError(error: unknown): NextResponse {
  logger.error('API Error:', error);

  // Handle BaseError and its subclasses
  if (error instanceof BaseError) {
    return NextResponse.json(
      error.toJSON(),
      { status: error.status }
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.errors,
        }
      },
      { status: 400 }
    );
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      {
        success: false,
        error: prismaError
      },
      { status: prismaError.status }
    );
  }

  // Handle generic errors
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message
      }
    },
    { status: 500 }
  );
}

function handlePrismaError(error: Prisma.PrismaClientKnownRequestError) {
  switch (error.code) {
    case 'P2002':
      return {
        code: 'DUPLICATE_ERROR',
        message: 'A record with this value already exists',
        details: error.meta,
        status: 409
      };
    case 'P2025':
      return {
        code: 'NOT_FOUND',
        message: 'Record not found',
        details: error.meta,
        status: 404
      };
    case 'P2003':
      return {
        code: 'FOREIGN_KEY_ERROR',
        message: 'Related record not found',
        details: error.meta,
        status: 400
      };
    default:
      return {
        code: 'DATABASE_ERROR',
        message: 'Database operation failed',
        details: error.message,
        status: 500
      };
  }
} 