import type { ApiErrorCode, ApiErrorOptions } from './types';

export class BaseError extends Error {
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

  toJSON(): { success: false; error: { code: ApiErrorCode; message: string; details?: unknown } } {
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
    const errorMap: Record<string, number> = {
      'UNAUTHORIZED': 401,
      'FORBIDDEN': 403,
      'NOT_FOUND': 404,
      'VALIDATION_ERROR': 400,
      'NETWORK_ERROR': 500,
      'TIMEOUT_ERROR': 504,
      'DATABASE_ERROR': 500,
      'RATE_LIMITED': 429,
      'INTERNAL_ERROR': 500,
      'UNKNOWN_ERROR': 500,
      'SERVER_ERROR': 500,
      'PROCESSING_ERROR': 500
    };

    return new BaseError(message, {
      code: type,
      status: errorMap[type] || 500,
      details
    });
  }
} 