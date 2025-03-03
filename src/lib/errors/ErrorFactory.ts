import type { ErrorCode } from './types';

export class CustomError extends Error {
  code: string;
  statusCode: number;
  
  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends CustomError {
  details: Record<string, unknown> | undefined;
  
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400);
    this.details = details;
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND', 404);
  }
}

export class ConflictError extends CustomError {
  constructor(message: string = 'Resource already exists') {
    super(message, 'CONFLICT', 409);
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT', 429);
  }
}

export class InternalServerError extends CustomError {
  constructor(message: string = 'Internal server error') {
    super(message, 'INTERNAL_SERVER_ERROR', 500);
  }
}

export class DatabaseError extends CustomError {
  constructor(message: string = 'Database error') {
    super(message, 'DATABASE_ERROR', 500);
  }
}

export class ServiceUnavailableError extends CustomError {
  constructor(message: string = 'Service unavailable') {
    super(message, 'SERVICE_UNAVAILABLE', 503);
  }
}

export const ErrorFactory = {
  create(code: ErrorCode, message: string): CustomError {
    switch (code) {
      case 'NOT_FOUND':
        return new CustomError(message, 'NOT_FOUND', 404);
      case 'UNAUTHORIZED':
        return new CustomError(message, 'UNAUTHORIZED', 401);
      case 'FORBIDDEN':
        return new CustomError(message, 'FORBIDDEN', 403);
      default:
        return new CustomError(message, 'VALIDATION_ERROR', 400);
    }
  },

  validation(message: string): CustomError {
    return new CustomError(message, 'VALIDATION_ERROR', 400);
  },

  notFound(resource: string): CustomError {
    return new CustomError(`${resource} not found`, 'NOT_FOUND', 404);
  },

  unauthorized(message = 'Unauthorized'): CustomError {
    return new CustomError(message, 'UNAUTHORIZED', 401);
  },

  forbidden(message = 'Forbidden'): CustomError {
    return new CustomError(message, 'FORBIDDEN', 403);
  }
}; 