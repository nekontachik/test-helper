import type { ErrorCode } from './types';

export class CustomError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code: ErrorCode = 'VALIDATION_ERROR'
  ) {
    super(message);
    this.name = 'CustomError';
  }
}

export const ErrorFactory = {
  create(code: ErrorCode, message: string): CustomError {
    switch (code) {
      case 'NOT_FOUND':
        return new CustomError(message, 404, code);
      case 'UNAUTHORIZED':
        return new CustomError(message, 401, code);
      case 'FORBIDDEN':
        return new CustomError(message, 403, code);
      default:
        return new CustomError(message, 400, code);
    }
  },

  validation(message: string): CustomError {
    return new CustomError(message, 400, 'VALIDATION_ERROR');
  },

  notFound(resource: string): CustomError {
    return new CustomError(`${resource} not found`, 404, 'NOT_FOUND');
  },

  unauthorized(message = 'Unauthorized'): CustomError {
    return new CustomError(message, 401, 'UNAUTHORIZED');
  },

  forbidden(message = 'Forbidden'): CustomError {
    return new CustomError(message, 403, 'FORBIDDEN');
  }
}; 