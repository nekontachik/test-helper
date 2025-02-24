import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from './types';
import { logger } from '@/lib/utils/logger';
import type { ApiErrorCode } from './types';
import type { ServiceResponse } from '../utils/serviceResponse';
import { ErrorTracker } from '../monitoring/ErrorTracker';
import { ErrorRecovery } from './ErrorRecovery';
import { getErrorMessage, getErrorSeverity } from './errorMessages';
import { ErrorFactory } from './ErrorFactory';
import type { ErrorCode } from './errorTypes';

type ErrorTuple = readonly [ErrorCode, string, number];

const ERROR_MAP = {
  // Prisma errors
  P2002: ['DATABASE_ERROR' as ErrorCode, 'Resource already exists', 409],
  P2025: ['NOT_FOUND' as ErrorCode, 'Resource not found', 404],
  P2003: ['DATABASE_ERROR' as ErrorCode, 'Related record not found', 400],
  // App errors
  VALIDATION: ['VALIDATION_ERROR' as ErrorCode, 'Validation failed', 400],
  NETWORK: ['NETWORK_ERROR' as ErrorCode, 'Network error occurred', 503],
  TIMEOUT: ['TIMEOUT_ERROR' as ErrorCode, 'Operation timed out', 504],
  DEFAULT: ['INTERNAL_ERROR' as ErrorCode, 'Internal server error', 500],
} as const;

export class ErrorHandler {
  static handleApiError(error: unknown): NextResponse {
    const errorResponse = this.createErrorResponse(error);
    const errorDetails = getErrorMessage(errorResponse);
    
    logger.error('API Error:', {
      code: errorResponse.code,
      message: errorResponse.message,
      details: errorResponse.details,
      severity: errorDetails.severity,
      stack: error instanceof Error ? error.stack : undefined
    });

    ErrorTracker.track(
      error instanceof Error ? error : new Error(errorResponse.message),
      'API',
      errorDetails.severity
    );

    return this.jsonResponse(errorResponse);
  }

  static async handle<T>(
    operation: () => Promise<T>,
    context = 'Operation',
    options: { 
      retry?: boolean; 
      track?: boolean;
      silent?: boolean;
      retryOptions?: Parameters<typeof ErrorRecovery.withRetry>[1];
    } = {}
  ): Promise<ServiceResponse<T>> {
    try {
      const result = options.retry 
        ? await ErrorRecovery.withRetry(operation, options.retryOptions)
        : await operation();
        
      return { success: true, data: result };
    } catch (error) {
      const errorResponse = this.createErrorResponse(error);
      const severity = getErrorSeverity(errorResponse.code);

      if (options.track) {
        ErrorTracker.track(
          error instanceof Error ? error : new Error(errorResponse.message),
          context,
          severity
        );
      }

      if (!options.silent) {
        logger.error(`Error in ${context}:`, {
          code: errorResponse.code,
          message: errorResponse.message,
          details: errorResponse.details,
          severity,
          stack: error instanceof Error ? error.stack : undefined
        });
      }

      return { success: false, error: errorResponse };
    }
  }

  static createErrorResponse(error: unknown): AppError {
    if (error instanceof AppError) return error;
    
    if (error instanceof ZodError) {
      return ErrorFactory.validation('Validation failed', { errors: error.errors });
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const [code, message, status] = this.getErrorTuple(error.code);
      return ErrorFactory.create(code, message, { meta: error.meta, status });
    }
    
    return ErrorFactory.create(
      'INTERNAL_ERROR' as ErrorCode,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }

  private static getErrorTuple(code: string): ErrorTuple {
    return ERROR_MAP[code as keyof typeof ERROR_MAP] || ERROR_MAP.DEFAULT;
  }

  private static jsonResponse(error: AppError): NextResponse {
    const errorDetails = getErrorMessage(error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          title: errorDetails.title,
          severity: errorDetails.severity
        }
      },
      { status: error.status }
    );
  }
} 