import type { ServiceResponse } from '../utils/serviceResponse';
import { ErrorHandler } from '../errors/ErrorHandler';
import type { AppError } from '../errors/types';

interface ServiceErrorOptions {
  context?: string;
  retry?: boolean;
  retryOptions?: {
    maxAttempts?: number;
    delayMs?: number;
    backoffFactor?: number;
    timeout?: number;
  };
  silent?: boolean;
  track?: boolean;
}

export class ServiceErrorHandler {
  static async execute<T>(
    operation: () => Promise<T>,
    options: ServiceErrorOptions = {}
  ): Promise<ServiceResponse<T>> {
    const context = options.context || 'Service';
    
    try {
      const result = await operation();
      return { success: true, data: result };
    } catch (error) {
      return this.handleError(error, context);
    }
  }

  static handleError(error: unknown, context = 'Service'): ServiceResponse<never> {
    const appError = ErrorHandler.createErrorResponse(error);
    return {
      success: false,
      error: {
        code: appError.code,
        message: appError.message,
        details: appError.details
      }
    };
  }

  static async withTransaction<T>(
    operation: () => Promise<ServiceResponse<T>>
  ): Promise<ServiceResponse<T>> {
    try {
      return await operation();
    } catch (error) {
      return this.handleError(error);
    }
  }
} 