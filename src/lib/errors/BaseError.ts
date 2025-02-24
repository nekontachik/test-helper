import type { AppError, ApiErrorCode, ApiErrorOptions } from './types';

export class BaseError extends Error implements AppError {
  public readonly code: ApiErrorCode;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(
    message: string,
    options: ApiErrorOptions = { code: 'INTERNAL_ERROR' }
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = options.code;
    this.status = options.status || 500;
    this.details = options.details;
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      }
    };
  }
}

// Create a centralized error factory
export class ErrorFactory {
  static create(
    type: ApiErrorCode, 
    message: string, 
    details?: Record<string, unknown>
  ): BaseError {
    const errorMap: Record<ApiErrorCode, number> = {
      'UNAUTHORIZED': 401,
      'FORBIDDEN': 403,
      'NOT_FOUND': 404,
      'VALIDATION_ERROR': 400,
      'CONFLICT': 409,
      'RATE_LIMITED': 429,
      'INTERNAL_ERROR': 500,
      'BAD_REQUEST': 400,
      'TEST_RUN_ERROR': 500,
      'FILE_UPLOAD_ERROR': 500,
      'TEST_RESULT_ERROR': 500,
      'INVALID_DATA': 400,
      'TRANSACTION_ERROR': 500
    };

    return new BaseError(message, {
      code: type,
      status: errorMap[type],
      details
    });
  }
} 