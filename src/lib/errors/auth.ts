export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class AuthenticationError extends AuthError {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AuthError {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class EmailVerificationError extends AuthError {
  constructor(message: string = 'Email verification failed') {
    super(message);
    this.name = 'EmailVerificationError';
  }
}

export class TokenError extends AuthError {
  constructor(message: string = 'Invalid or expired token') {
    super(message);
    this.name = 'TokenError';
  }
}

export class TwoFactorError extends AuthError {
  constructor(message: string = 'Two-factor authentication failed') {
    super(message);
    this.name = 'TwoFactorError';
  }
}

export class SessionError extends AuthError {
  constructor(message: string = 'Invalid or expired session') {
    super(message);
    this.name = 'SessionError';
  }
}

export class AccountLockoutError extends AuthError {
  constructor(
    message: string = 'Account locked due to too many failed attempts',
    public readonly unlockTime?: Date
  ) {
    super(message);
    this.name = 'AccountLockoutError';
  }
} 