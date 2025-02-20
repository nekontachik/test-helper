import { BaseError } from '../BaseError';
import type { ApiErrorOptions } from '../types';

export class TestRunError extends BaseError {
  constructor(message: string, options?: Omit<ApiErrorOptions, 'code'>) {
    super(message, { 
      code: 'TEST_RUN_ERROR',
      ...options 
    });
  }
}

export class TestResultError extends BaseError {
  constructor(message: string, options?: Omit<ApiErrorOptions, 'code'>) {
    super(message, {
      code: 'TEST_RESULT_ERROR',
      ...options
    });
  }
}

export class FileUploadError extends BaseError {
  constructor(message: string, options?: Omit<ApiErrorOptions, 'code'>) {
    super(message, {
      code: 'FILE_UPLOAD_ERROR',
      ...options
    });
  }
} 