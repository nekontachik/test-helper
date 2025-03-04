/**
 * Custom error classes for authentication-related errors
 */

import { BaseError } from './BaseError';

export class AuthenticationError extends BaseError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, {
      code: 'AUTHENTICATION_ERROR',
      status: 401,
      details
    });
  }
}

export class InvalidCredentialsError extends AuthenticationError {
  constructor(details?: Record<string, unknown>) {
    super('Invalid email or password', details);
  }
}

export class AccountLockedError extends AuthenticationError {
  constructor(details?: Record<string, unknown>) {
    super('Account is locked due to too many failed attempts', {
      ...details,
      lockReason: 'FAILED_ATTEMPTS'
    });
  }
}

export class AccountDisabledError extends AuthenticationError {
  constructor(details?: Record<string, unknown>) {
    super('Account has been disabled', details);
  }
}

export class EmailNotVerifiedError extends AuthenticationError {
  constructor(details?: Record<string, unknown>) {
    super('Email address has not been verified', details);
  }
}

export class TokenExpiredError extends AuthenticationError {
  constructor(tokenType: string, details?: Record<string, unknown>) {
    super(`${tokenType} token has expired`, details);
  }
}

export class InvalidTokenError extends AuthenticationError {
  constructor(tokenType: string, details?: Record<string, unknown>) {
    super(`Invalid ${tokenType} token`, details);
  }
}

export class AuthorizationError extends BaseError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, {
      code: 'AUTHORIZATION_ERROR',
      status: 403,
      details
    });
  }
}

export class InsufficientPermissionsError extends AuthorizationError {
  constructor(requiredRole: string, currentRole: string, details?: Record<string, unknown>) {
    super(`Insufficient permissions. Required: ${requiredRole}, Current: ${currentRole}`, details);
  }
}

export class SessionExpiredError extends Error {
  constructor(message = 'Your session has expired. Please sign in again.') {
    super(message);
    this.name = 'SessionExpiredError';
  }
}

/**
 * Utility function to check if an error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error instanceof AuthenticationError ||
      error instanceof AuthorizationError ||
      error instanceof SessionExpiredError ||
      error instanceof InvalidCredentialsError ||
      error.name === 'AuthenticationError' ||
      error.name === 'AuthorizationError' ||
      error.name === 'SessionExpiredError' ||
      error.name === 'InvalidCredentialsError' ||
      error.message.toLowerCase().includes('authentication') ||
      error.message.toLowerCase().includes('unauthorized') ||
      error.message.toLowerCase().includes('not authenticated') ||
      error.message.toLowerCase().includes('session expired') ||
      error.message.toLowerCase().includes('invalid credentials')
    );
  }
  return false;
}

/**
 * Handle authentication errors by redirecting to signin
 */
export function handleAuthError(error: unknown): void {
  if (typeof window !== 'undefined' && isAuthError(error)) {
    // Clear any auth state
    localStorage.removeItem('token');
    sessionStorage.clear();
    
    // Redirect to signin
    window.location.href = '/auth/signin';
  }
} 