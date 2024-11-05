export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly resetIn: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof RateLimitError) {
    return `${error.message} Please try again in ${Math.ceil(error.resetIn / 1000)} seconds.`;
  }
  if (error instanceof AuthError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  SESSION_REQUIRED: 'Authentication required',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  NETWORK_ERROR: 'Network error occurred',
  INVALID_CSRF: 'Invalid or missing CSRF token',
  RATE_LIMIT: 'Too many attempts',
  UNKNOWN: 'An unexpected error occurred',
  INVALID_TOKEN: 'Invalid verification token',
  TOKEN_EXPIRED: 'Verification token has expired',
  EMAIL_NOT_VERIFIED: 'Please verify your email address',
} as const; 