export * from './auth';
export * from './validation';
export * from './security';

// Base error class for all application errors
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Authentication related errors
export class AuthenticationError extends AppError {
  constructor(message: string) {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

// Authorization related errors
export class AuthorizationError extends AppError {
  constructor(message: string) {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

// Token related errors
export class TokenError extends AppError {
  constructor(
    message: string,
    code: string = 'TOKEN_ERROR',
    statusCode: number = 401
  ) {
    super(message, statusCode, code);
    this.name = 'TokenError';
  }
}

// Rate limiting errors
export class RateLimitError extends AppError {
  constructor(
    message: string,
    public resetIn: number,
    code: string = 'RATE_LIMIT_ERROR',
    statusCode: number = 429
  ) {
    super(message, statusCode, code);
    this.name = 'RateLimitError';
  }
}

// Validation errors
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

// Not found errors
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

// Generic error handler
export function handleError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  return new Error('An unknown error occurred');
}

// HTTP status code mapping
export const errorStatusCodes: Record<string, number> = {
  AuthenticationError: 401,
  AuthorizationError: 403,
  ValidationError: 400,
  TokenError: 401,
  RateLimitError: 429,
  SecurityError: 403,
  NotFoundError: 404,
  DuplicateError: 409,
  InputValidationError: 400,
  SessionError: 401,
  AccountLockoutError: 423,
  // Add more mappings as needed
};

// Get HTTP status code for error
export function getErrorStatus(error: Error): number {
  return errorStatusCodes[error.constructor.name] || 500;
}

// Database errors
export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 500, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}