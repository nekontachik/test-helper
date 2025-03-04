import logger from '../../lib/utils/logger';
import { TestRunError } from './types';

/**
 * Helper function to determine if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && 
    (error.message.includes('network') || 
     error.message.includes('fetch') || 
     error.message.includes('Failed to fetch') ||
     error.message.includes('Network request failed'));
}

/**
 * Helper function to create a retry delay with exponential backoff
 */
export function getRetryDelay(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 seconds
}

/**
 * Helper function to log performance metrics
 */
export function logPerformance(
  action: string, 
  startTime: number, 
  metadata: Record<string, unknown>
): number {
  const duration = Math.round(performance.now() - startTime);
  logger.debug(`${action} completed`, { 
    ...metadata,
    duration: `${duration}ms`
  });
  return duration;
}

/**
 * Helper function to handle common API errors
 */
export function handleApiError(
  error: unknown, 
  action: string,
  metadata: Record<string, unknown>
): never {
  const networkError = isNetworkError(error);
  
  logger.error(`Failed to ${action}`, { 
    ...metadata,
    isNetworkError: networkError,
    error: error instanceof Error ? error.message : String(error)
  });
  
  if (networkError) {
    throw new TestRunError(
      'Network error: Please check your connection and try again',
      'NETWORK_ERROR'
    );
  }
  
  // Handle common error types
  if (error instanceof Error) {
    if (error.message.includes('not found')) {
      throw new TestRunError(
        `Resource not found or you don't have access to it`,
        'NOT_FOUND'
      );
    }
    
    if (error.message.includes('unauthorized')) {
      throw new TestRunError(
        `You don't have permission to perform this action`,
        'UNAUTHORIZED'
      );
    }
    
    if (error.message.includes('validation')) {
      throw new TestRunError(
        'Invalid data: Please check your inputs',
        'VALIDATION_ERROR'
      );
    }
    
    throw new TestRunError(error.message);
  }
  
  throw new TestRunError(`Failed to ${action}`);
} 