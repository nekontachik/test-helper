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

export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

export function createErrorContext(error: unknown): {
  message: string;
  stack: string | undefined;
  details: unknown;
} {
  return {
    message: getErrorMessage(error),
    stack: isError(error) ? error.stack : undefined,
    details: error,
  };
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
  PASSWORD_COMPROMISED: 'This password has been found in data breaches. Please choose a different password.',
  USER_EXISTS: 'A user with this email already exists',
} as const; 