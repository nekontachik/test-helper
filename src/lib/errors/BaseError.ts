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