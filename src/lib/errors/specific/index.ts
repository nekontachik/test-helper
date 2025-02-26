import { BaseError } from '../BaseError';
import type { ApiErrorOptions } from '../types';

export class AuthenticationError extends BaseError {
  constructor(message: string = 'Authentication required', options?: Omit<ApiErrorOptions, 'code' | 'status'>) {
    super(message, {
      ...options,
      code: 'AUTHENTICATION_ERROR',
      status: 401,
    });
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string = 'Resource not found', options?: Omit<ApiErrorOptions, 'code' | 'status'>) {
    super(message, {
      ...options,
      code: 'NOT_FOUND',
      status: 404,
    });
  }
}

export class ValidationError extends BaseError {
  constructor(message: string = 'Validation failed', options?: Omit<ApiErrorOptions, 'code' | 'status'>) {
    super(message, {
      ...options,
      code: 'VALIDATION_ERROR',
      status: 400,
    });
  }
}

export class DatabaseError extends BaseError {
  constructor(message: string = 'Database operation failed', options?: Omit<ApiErrorOptions, 'code' | 'status'>) {
    super(message, {
      ...options,
      code: 'DATABASE_ERROR',
      status: 500,
    });
  }
} 