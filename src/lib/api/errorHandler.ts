import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import type { Prisma } from '@prisma/client';
import { logger } from '@/lib/utils/logger';

interface ErrorResponseData {
  code: string;
  message: string;
  details?: unknown;
}

interface ErrorResponse {
  error: ErrorResponseData;
}

// Helper function to create API error responses
function createApiError(
  message: string,
  code: string = 'INTERNAL_SERVER_ERROR',
  details?: unknown
): ErrorResponse {
  return {
    error: {
      code,
      message,
      ...(details ? { details } : {})
    }
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): NextResponse {
  logger.error('API Error:', error);

  if (error instanceof ZodError) {
    return NextResponse.json(
      createApiError('Validation failed', 'VALIDATION_ERROR', error.errors),
      { status: 400 }
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      createApiError(error.message, error.code),
      { status: error.status }
    );
  }

  // Prisma errors handling
  if (error && typeof error === 'object' && 'constructor' in error && 
      error.constructor && typeof error.constructor === 'function' && 
      error.constructor.name === 'PrismaClientKnownRequestError') {
    return NextResponse.json(
      createApiError('Database error', 'DB_ERROR'),
      { status: 500 }
    );
  }

  return NextResponse.json(
    createApiError('Internal server error'),
    { status: 500 }
  );
}

interface PrismaErrorResponse {
  error: ErrorResponseData;
  status: number;
}

function _handlePrismaError(error: Prisma.PrismaClientKnownRequestError): PrismaErrorResponse {
  switch (error.code) {
    case 'P2002': // Unique constraint violation
      return {
        error: {
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
          message: 'A record with this value already exists',
          details: error.meta,
        },
        status: 409,
      };

    case 'P2025': // Record not found
      return {
        error: {
          code: 'NOT_FOUND',
          message: 'Record not found',
          details: error.meta,
        },
        status: 404,
      };

    case 'P2003': // Foreign key constraint violation
      return {
        error: {
          code: 'FOREIGN_KEY_CONSTRAINT_VIOLATION',
          message: 'Related record not found',
          details: error.meta,
        },
        status: 400,
      };

    case 'P2014': // Invalid ID
      return {
        error: {
          code: 'INVALID_ID',
          message: 'Invalid ID value provided',
          details: error.meta,
        },
        status: 400,
      };

    default:
      return {
        error: {
          code: 'DATABASE_ERROR',
          message: 'Database operation failed',
          details: error.message,
        },
        status: 500,
      };
  }
}

export function isErrorResponse(response: unknown): response is ErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof (response as ErrorResponse).error === 'object' &&
    'code' in (response as ErrorResponse).error &&
    'message' in (response as ErrorResponse).error
  );
} 