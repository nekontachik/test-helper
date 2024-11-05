export * from './auth';
export * from './validation';
export * from './security';

// Base error class for all application errors
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Authentication related errors
export class AuthenticationError extends AppError {
  constructor(
    message: string,
    code: string = 'AUTHENTICATION_ERROR',
    statusCode: number = 401
  ) {
    super(message, code, statusCode);
    this.name = 'AuthenticationError';
  }
}

// Authorization related errors
export class AuthorizationError extends AppError {
  constructor(
    message: string,
    code: string = 'AUTHORIZATION_ERROR',
    statusCode: number = 403
  ) {
    super(message, code, statusCode);
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
    super(message, code, statusCode);
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
    super(message, code, statusCode);
    this.name = 'RateLimitError';
  }
}

// Validation errors
export class ValidationError extends AppError {
  constructor(
    message: string,
    code: string = 'VALIDATION_ERROR',
    statusCode: number = 400
  ) {
    super(message, code, statusCode);
    this.name = 'ValidationError';
  }
}

// Not found errors
export class NotFoundError extends AppError {
  constructor(
    message: string,
    code: string = 'NOT_FOUND_ERROR',
    statusCode: number = 404
  ) {
    super(message, code, statusCode);
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