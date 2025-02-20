export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
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
  | 'INTERNAL_ERROR'
  | 'BAD_REQUEST'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'TEST_RUN_ERROR'
  | 'FILE_UPLOAD_ERROR'
  | 'TEST_RESULT_ERROR'
  | 'INVALID_DATA'
  | 'TRANSACTION_ERROR';

export interface ApiErrorOptions {
  code: ApiErrorCode;
  status?: number;
  details?: Record<string, unknown>;
}

export interface AppError {
  code: ApiErrorCode;
  status?: number;
  details?: unknown;
  message: string;
  name: string;
  stack?: string;
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