interface RateLimitErrorInfo {
  limit: number;
  remaining: number;
  reset: Date;
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public info: RateLimitErrorInfo
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
} 