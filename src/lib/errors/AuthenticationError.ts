export class AuthenticationError extends Error {
  constructor(
    message: string,
    public code: string = 'AUTHENTICATION_ERROR',
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
} 