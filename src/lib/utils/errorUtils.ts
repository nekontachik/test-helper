import { logger } from './logger';
import type { AppError, ErrorResponse } from '@/lib/errors/types';
import { BaseError } from '@/lib/errors/BaseError';

/**
 * Converts any error to an AppError instance
 */
export function normalizeError(error: unknown): AppError {
  if (error instanceof BaseError) {
    return error;
  }

  if (error instanceof Error) {
    return new BaseError(error.message);
  }

  if (typeof error === 'string') {
    return new BaseError(error);
  }

  return new BaseError('An unknown error occurred');
}

/**
 * Formats error for API response
 */
export function formatErrorResponse(error: unknown): ErrorResponse {
  const normalizedError = normalizeError(error);
  
  return {
    success: false,
    error: {
      code: normalizedError.code,
      message: normalizedError.message,
      details: normalizedError.details
    }
  };
}

/**
 * Logs error with context
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  const normalizedError = normalizeError(error);
  
  logger.error('Error occurred:', {
    code: normalizedError.code,
    message: normalizedError.message,
    details: normalizedError.details,
    context,
    stack: normalizedError.stack
  });
} 