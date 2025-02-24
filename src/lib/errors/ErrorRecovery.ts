import { AppError } from './types';
import { logger } from '@/lib/utils/logger';
import { ErrorTracker } from '../monitoring/ErrorTracker';

interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffFactor?: number;
  timeout?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffFactor: 2,
  timeout: 30000
};

export class ErrorRecovery {
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const startTime = Date.now();

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
      try {
        if (opts.timeout && Date.now() - startTime > opts.timeout) {
          throw new Error('Operation timed out');
        }
        return await operation();
      } catch (error) {
        const shouldRetry = attempt < opts.maxAttempts && this.isRetryable(error);
        
        if (shouldRetry) {
          const delay = opts.delayMs * Math.pow(opts.backoffFactor, attempt - 1);
          logger.warn(`Retry attempt ${attempt}/${opts.maxAttempts} after ${delay}ms`, { error });
          ErrorTracker.track(error as Error, 'retry', 'warning');
          opts.onRetry?.(attempt, error as Error);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw error;
      }
    }
    throw new Error('Max retry attempts reached');
  }

  private static isRetryable(error: unknown): boolean {
    if (error instanceof AppError) {
      return ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'RATE_LIMITED'].includes(error.code);
    }
    return error instanceof Error && 
      ['NetworkError', 'TimeoutError'].includes(error.name);
  }
} 