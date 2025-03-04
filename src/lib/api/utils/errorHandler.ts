import axios from 'axios';
import { ApiError } from '@/lib/errors/ApiError';

// Define ApiErrorCode type locally if it's not available from the types module
type ApiErrorCode = 
  | 'BAD_REQUEST' 
  | 'UNAUTHORIZED' 
  | 'FORBIDDEN' 
  | 'NOT_FOUND' 
  | 'RATE_LIMIT' 
  | 'INTERNAL_ERROR' 
  | 'OFFLINE';

/**
 * Handles API errors and converts them to ApiError instances
 */
export function handleApiError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    switch (status) {
      case 400:
        return new ApiError('BAD_REQUEST' as ApiErrorCode, data?.message || 'Invalid request');
      case 401:
        return new ApiError('UNAUTHORIZED' as ApiErrorCode, 'Authentication required');
      case 403:
        return new ApiError('FORBIDDEN' as ApiErrorCode, 'Access denied');
      case 404:
        return new ApiError('NOT_FOUND' as ApiErrorCode, 'Resource not found');
      case 429:
        return new ApiError('RATE_LIMIT' as ApiErrorCode, 'Too many requests');
      case 500:
        return new ApiError('INTERNAL_ERROR' as ApiErrorCode, 'Server error');
      default:
        return new ApiError('INTERNAL_ERROR' as ApiErrorCode, 'An unexpected error occurred');
    }
  }
  
  if (error instanceof ApiError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new ApiError('INTERNAL_ERROR' as ApiErrorCode, error.message);
  }
  
  return new ApiError('INTERNAL_ERROR' as ApiErrorCode, 'An unexpected error occurred');
}