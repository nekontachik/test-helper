import { useState, useCallback } from 'react';
import { AppError } from '@/lib/errors';

interface ErrorState {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

export function useErrorHandler() {
  const [error, setError] = useState<ErrorState | null>(null);
  const [loading, setLoading] = useState(false);

  const handleError = useCallback((error: unknown) => {
    if (error instanceof AppError) {
      setError({
        message: error.message,
        code: error.code,
        status: error.statusCode,
        details: {
          name: error.name,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      });
    } else if (error instanceof Error) {
      setError({
        message: error.message,
        details: { 
          name: error.name, 
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        }
      });
    } else {
      setError({
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        status: 500
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const withErrorHandling = useCallback(
    async <T,>(operation: () => Promise<T>): Promise<T | undefined> => {
      try {
        setLoading(true);
        clearError();
        return await operation();
      } catch (error) {
        handleError(error);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [handleError, clearError]
  );

  return {
    error,
    loading,
    handleError,
    clearError,
    withErrorHandling,
  };
}
