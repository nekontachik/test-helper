export class NetworkError extends Error {
  constructor(message = 'Network error occurred', public readonly cause?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message = 'Operation timed out', public readonly timeout?: number) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly meta?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly fields: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
} 