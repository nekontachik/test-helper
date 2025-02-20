import { useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';
import { normalizeError } from '@/lib/utils/errorUtils';

export function useApiErrorHandler() {
  const { handleError } = useErrorHandler();

  const handleApiError = useCallback((error: unknown) => {
    const normalizedError = normalizeError(error);
    handleError(normalizedError);
  }, [handleError]);

  const withApiErrorHandling = useCallback(async <T,>(
    operation: () => Promise<T>
  ): Promise<T | undefined> => {
    try {
      return await operation();
    } catch (error) {
      handleApiError(error);
      return undefined;
    }
  }, [handleApiError]);

  return {
    handleApiError,
    withApiErrorHandling
  };
} 