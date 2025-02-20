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
  | 'TEST_RUN_ERROR'
  | 'TEST_RESULT_ERROR'
  | 'FILE_UPLOAD_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'VALIDATION_ERROR';

export interface ApiErrorOptions {
  code: ApiErrorCode;
  status?: number;
  details?: Record<string, unknown>;
} 