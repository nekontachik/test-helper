/**
 * Custom error classes for authentication-related errors
 */

export class AuthenticationError extends Error {
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Not authorized to access this resource') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class SessionExpiredError extends Error {
  constructor(message = 'Your session has expired. Please sign in again.') {
    super(message);
    this.name = 'SessionExpiredError';
  }
}

export class InvalidCredentialsError extends Error {
  constructor(message = 'Invalid email or password') {
    super(message);
    this.name = 'InvalidCredentialsError';
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