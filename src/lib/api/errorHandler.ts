import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import type { Prisma } from '@prisma/client';
import { logger } from '@/lib/logger';
import { 
  CustomError, 
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalServerError,
  DatabaseError
} from '@/lib/errors/ErrorFactory';

// Re-export error classes for convenience
export { 
  CustomError, 
  ValidationError as ApiValidationError,
  AuthenticationError as AuthError,
  AuthorizationError as PermissionError,
  NotFoundError as ResourceNotFoundError,
  ConflictError,
  RateLimitError,
  InternalServerError as ServerError,
  DatabaseError
};

/**
 * Unified API error handler
 * @param error - The error to handle
 * @returns NextResponse with appropriate error details
 */
export function handleApiError(error: unknown): NextResponse {
  logger.error('API error:', { error });

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      { 
        error: 'Validation error', 
        details: error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      },
      { status: 400 }
    );
  }

  // Handle custom errors
  if (error instanceof CustomError) {
    return NextResponse.json(
      { 
        error: error.message,
        code: error.code,
        ...(error instanceof ValidationError && error.details ? { details: error.details } : {})
      },
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors
  if (isPrismaError(error)) {
    const { status, error: errorData } = handlePrismaError(error);
    return NextResponse.json(errorData, { status });
  }

  // Handle unknown errors
  logger.error('Unhandled API error:', { error });
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// Helper function to check if an error is a Prisma error
function isPrismaError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'clientVersion' in error &&
    typeof (error as any).code === 'string' &&
    (error as any).code.startsWith('P')
  );
}

// Helper function to handle Prisma errors
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError) {
  switch (error.code) {
    case 'P2002': // Unique constraint violation
      return {
        error: {
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
          error: 'A record with this value already exists',
          details: error.meta,
        },
        status: 409,
      };

    case 'P2025': // Record not found
      return {
        error: {
          code: 'NOT_FOUND',
          error: 'Record not found',
          details: error.meta,
        },
        status: 404,
      };

    // Add other Prisma error codes as needed

    default:
      return {
        error: {
          code: 'DATABASE_ERROR',
          error: 'Database operation failed',
        },
        status: 500,
      };
  }
}

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