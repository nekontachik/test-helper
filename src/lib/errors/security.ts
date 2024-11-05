export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
  }
}

export class RateLimitError extends SecurityError {
  constructor(
    message: string = 'Too many requests',
    public readonly retryAfter?: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class BreachedPasswordError extends SecurityError {
  constructor(message: string = 'This password has appeared in known data breaches') {
    super(message);
    this.name = 'BreachedPasswordError';
  }
}

export class WeakPasswordError extends SecurityError {
  constructor(
    message: string = 'Password does not meet security requirements',
    public readonly requirements?: string[]
  ) {
    super(message);
    this.name = 'WeakPasswordError';
  }
}

export class InvalidTokenError extends SecurityError {
  constructor(
    message: string = 'Invalid or expired security token',
    public readonly tokenType?: string
  ) {
    super(message);
    this.name = 'InvalidTokenError';
  }
}

export class SecurityPolicyError extends SecurityError {
  constructor(
    message: string = 'Operation violates security policy',
    public readonly policy?: string
  ) {
    super(message);
    this.name = 'SecurityPolicyError';
  }
}

export class MFARequiredError extends SecurityError {
  constructor(message: string = 'Multi-factor authentication required') {
    super(message);
    this.name = 'MFARequiredError';
  }
} 