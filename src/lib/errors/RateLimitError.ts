export interface RateLimitErrorInfo {
  resetIn: number;
  limit: number;
  remaining: number;
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly info: RateLimitErrorInfo
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
} 