import type { ServiceResponse } from '../utils/serviceResponse';
import { ErrorHandler } from '../errors/errorHandler';

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
    try {
      const result = await operation();
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return this.handleError(error, options.context);
    }
  }

  static handleError(error: unknown, context = 'Service'): ServiceResponse<never> {
    // Log the error
    console.error(`Error in ${context}:`, error);
    
    // Create a standardized error response
    const errorResponse = ErrorHandler.createErrorResponse(error);
    
    return {
      success: false,
      error: errorResponse
    };
  }

  static async withTransaction<T>(
    operation: () => Promise<ServiceResponse<T>>
  ): Promise<ServiceResponse<T>> {
    try {
      return await operation();
    } catch (error) {
      return this.handleError(error, 'Transaction');
    }
  }
} 