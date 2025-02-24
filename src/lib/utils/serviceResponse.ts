import { BaseError } from '@/lib/errors/BaseError';
import type { ApiErrorCode } from '@/lib/errors/types';

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
}

export const serviceResponse = {
  success<T>(data: T): ServiceResponse<T> {
    return {
      success: true,
      data
    };
  },

  error(error: Error | BaseError): ServiceResponse<never> {
    return {
      success: false,
      error: {
        code: error instanceof BaseError ? error.code : 'INTERNAL_ERROR',
        message: error.message,
        details: error instanceof BaseError ? error.details : undefined
      }
    };
  }
}; 