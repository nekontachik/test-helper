import { BaseError } from '../BaseError';
import { ApiErrorOptions } from '../types';

export class TestRunError extends BaseError {
  constructor(message: string = 'Test run operation failed', options?: Omit<ApiErrorOptions, 'code'>) {
    super(message, {
      ...options,
      code: 'TEST_RUN_ERROR',
      status: options?.status || 500,
    });
  }
}

export class TestResultError extends BaseError {
  constructor(message: string = 'Test result operation failed', options?: Omit<ApiErrorOptions, 'code'>) {
    super(message, {
      ...options,
      code: 'TEST_RESULT_ERROR',
      status: options?.status || 400,
    });
  }
}

export class FileUploadError extends BaseError {
  constructor(message: string = 'File upload failed', options?: Omit<ApiErrorOptions, 'code'>) {
    super(message, {
      ...options,
      code: 'FILE_UPLOAD_ERROR',
      status: options?.status || 400,
    });
  }
} 