export class AuthError extends Error {
  constructor(
    public message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
} 