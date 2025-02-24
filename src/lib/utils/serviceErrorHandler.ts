import type { ServiceResponse } from './serviceResponse';
import type { ApiErrorCode } from '@/lib/errors/types';

interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: unknown;
}

export class ServiceErrorHandler {
  static async withTransaction<T>(
    operation: () => Promise<ServiceResponse<T>>
  ): Promise<ServiceResponse<T>> {
    try {
      return await operation();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error
        }
      };
    }
  }
} 