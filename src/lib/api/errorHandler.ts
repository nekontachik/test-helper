'use server';

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
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
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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

export interface ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;
}

/**
 * Error codes and their user-friendly messages
 */
const ERROR_MESSAGES = {
  'NOT_FOUND': 'The requested resource could not be found.',
  'UNAUTHORIZED': 'You do not have permission to access this resource.',
  'FORBIDDEN': 'Access to this resource is forbidden.',
  'VALIDATION_ERROR': 'The data provided is invalid.',
  'NETWORK_ERROR': 'There was a problem connecting to the server.',
  'SERVER_ERROR': 'The server encountered an error while processing your request.',
  'CONFLICT': 'The request could not be completed due to a conflict with the current state of the resource.',
  'BAD_REQUEST': 'The request was invalid or cannot be otherwise served.',
  'RATE_LIMIT_EXCEEDED': 'You have exceeded the rate limit. Please try again later.',
  'DEFAULT': 'An unexpected error occurred. Our team has been notified.'
} as const;

/**
 * Maps Prisma error codes to API error codes
 */
const PRISMA_ERROR_MAP: Record<string, string> = {
  'P2001': 'NOT_FOUND', // Record does not exist
  'P2002': 'CONFLICT',  // Unique constraint failed
  'P2003': 'CONFLICT',  // Foreign key constraint failed
  'P2025': 'NOT_FOUND', // Record to update not found
};

/**
 * Creates an API error with the given code, message, and status
 */
export function createApiError(code: string, message: string, status = 500, details?: unknown): ApiError {
  const error = new Error(message) as ApiError;
  error.code = code;
  error.status = status;
  error.details = details;
  return error;
}

/**
 * Gets a user-friendly error message based on the error code
 */
export function getUserFriendlyMessage(errorCode: string): string {
  return errorCode in ERROR_MESSAGES 
    ? ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES] 
    : ERROR_MESSAGES.DEFAULT;
}

/**
 * Unified API error handler
 * @param error - The error to handle
 * @returns NextResponse with appropriate error details
 */
export function handleApiError(error: unknown): NextResponse {
  logger.error('API error:', { error });

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message
    }));
    
    return NextResponse.json(
      { 
        error: 'Validation error', 
        code: 'VALIDATION_ERROR',
        message: getUserFriendlyMessage('VALIDATION_ERROR'),
        details: formattedErrors 
      },
      { status: 400 }
    );
  }

  // Handle Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    const errorCode = PRISMA_ERROR_MAP[error.code] || 'SERVER_ERROR';
    const status = errorCode === 'NOT_FOUND' ? 404 : 
                  errorCode === 'CONFLICT' ? 409 : 500;
    
    return NextResponse.json(
      { 
        error: error.message,
        code: errorCode,
        message: getUserFriendlyMessage(errorCode)
      },
      { status }
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

  // Handle unknown errors
  const message = error instanceof Error ? error.message : 'Unknown error';
  return NextResponse.json(
    { 
      error: message,
      code: 'SERVER_ERROR',
      message: getUserFriendlyMessage('SERVER_ERROR')
    },
    { status: 500 }
  );
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
// Using underscore prefix to indicate intentionally unused function
function _createApiError(
  message: string,
  code = 'INTERNAL_SERVER_ERROR',
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