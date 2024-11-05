export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class PasswordValidationError extends ValidationError {
  constructor(message: string = 'Password does not meet requirements') {
    super(message);
    this.name = 'PasswordValidationError';
  }
}

export class EmailValidationError extends ValidationError {
  constructor(message: string = 'Invalid email format') {
    super(message);
    this.name = 'EmailValidationError';
  }
}

export class InputValidationError extends ValidationError {
  constructor(
    public readonly errors: Record<string, string[]>,
    message: string = 'Invalid input'
  ) {
    super(message);
    this.name = 'InputValidationError';
  }
}

export class DuplicateError extends ValidationError {
  constructor(
    field: string,
    message: string = `${field} already exists`
  ) {
    super(message, field);
    this.name = 'DuplicateError';
  }
} 