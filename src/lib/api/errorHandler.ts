import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { 
  AppError, 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  DatabaseError
} from '@/lib/errors';
import { logger } from '@/lib/utils/logger';

interface ErrorResponseData {
  code: string;
  message: string;
  details?: unknown;
}

interface ErrorResponse {
  error: ErrorResponseData;
}

export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  // Log all errors
  logger.error('API Error:', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    type: error instanceof Error ? error.constructor.name : typeof error,
  });

  // Handle known application errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code || 'APP_ERROR',
          message: error.message,
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.errors,
        },
      },
      { status: 400 }
    );
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = handlePrismaError(error);
    return NextResponse.json(
      { error: prismaError.error },
      { status: prismaError.status }
    );
  }

  // Handle unexpected errors
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 }
  );
}

interface PrismaErrorResponse {
  error: ErrorResponseData;
  status: number;
}

function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): PrismaErrorResponse {
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