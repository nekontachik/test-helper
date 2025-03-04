import { toast } from 'react-hot-toast';
import { TestRunError } from './types';
import logger from '../../lib/utils/logger';
import { isNetworkError } from './utils';

export const handleMutationError = (
  error: Error, 
  operation: string,
  details: Record<string, unknown>
): never => {
  const duration = Math.round(performance.now() - (details.startTime as number));
  const networkError = isNetworkError(error);
  
  logger.error(`Failed to ${operation}`, { 
    ...details,
    duration: `${duration}ms`,
    isNetworkError: networkError,
    error: error instanceof Error ? error.message : String(error)
  });
  
  if (networkError) {
    throw new TestRunError(
      'Network error: Please check your connection and try again',
      'NETWORK_ERROR'
    );
  }
  
  // Handle validation errors
  if (error instanceof Error && error.message.includes('validation')) {
    throw new TestRunError(
      'Invalid test run data: Please check your inputs',
      'VALIDATION_ERROR'
    );
  }
  
  // Handle not found errors
  if (error instanceof Error && error.message.includes('not found')) {
    throw new TestRunError(
      'Test run not found or already deleted',
      'NOT_FOUND'
    );
  }
  
  throw error instanceof Error 
    ? new TestRunError(error.message)
    : new TestRunError(`Failed to ${operation}`);
};

export const handleToastError = (
  error: Error, 
  operation: string,
  showToasts = true
): void => {
  if (!showToasts) return;
  
  let errorMessage = `Failed to ${operation}`;
  
  if (error instanceof TestRunError) {
    switch (error.code) {
      case 'NETWORK_ERROR':
      case 'VALIDATION_ERROR':
      case 'NOT_FOUND':
        errorMessage = error.message;
        break;
      default:
        errorMessage = `Failed to ${operation}: ${error.message}`;
    }
  } else if (error instanceof Error) {
    errorMessage = `Failed to ${operation}: ${error.message}`;
  }
  
  toast.error(errorMessage);
};

export const logSuccess = (
  operation: string,
  details: Record<string, unknown>
): void => {
  const duration = Math.round(performance.now() - (details.startTime as number));
  logger.debug(`${operation} successful`, { 
    ...details,
    duration: `${duration}ms`
  });
}; 