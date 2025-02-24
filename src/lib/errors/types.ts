export type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR';

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: unknown;
}

export interface ErrorDetails {
  path?: string;
  field?: string;
  code?: string;
  message?: string;
}

export type ApiErrorCode = 
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'DATABASE_ERROR'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'UNKNOWN_ERROR'
  | 'SERVER_ERROR'
  | 'PROCESSING_ERROR';

export interface ApiErrorOptions {
  code: ApiErrorCode;
  status?: number;
  details?: Record<string, unknown>;
  cause?: unknown;
}

export interface BaseErrorOptions {
  code?: ErrorCode;
  status?: number;
  cause?: unknown;
  details?: Record<string, unknown>;
}

export interface BaseError {
  code: ApiErrorCode;
  message: string;
  status: number;
  details?: unknown;
}

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface ErrorOptions {
  code: ErrorCode;
  status?: number;
  details?: unknown;
  severity?: ErrorSeverity;
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;
  readonly severity: ErrorSeverity;

  constructor(message: string, options: ErrorOptions) {
    super(message);
    this.name = 'AppError';
    this.code = options.code;
    this.status = options.status || 500;
    this.details = options.details;
    this.severity = options.severity || 'error';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, { 
      code: 'VALIDATION_ERROR',
      status: 400,
      details,
      severity: 'warning'
    });
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, {
      code: 'NOT_FOUND',
      status: 404,
      severity: 'warning'
    });
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(message, {
      code: 'UNAUTHORIZED',
      status: 401,
      severity: 'error'
    });
  }
}

export interface ErrorState {
  message: string;
  code: ApiErrorCode;
  details?: unknown;
  status?: number;
}

export type ErrorHandlerOptions = {
  silent?: boolean;
  retryCount?: number;
  retryDelay?: number;
};

// Use composition over inheritance
export const createError = (
  code: ErrorCode,
  message: string,
  status = 500,
  details?: Record<string, unknown>
): BaseError => ({
  code,
  message,
  status,
  details
}); 