import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { logger } from '@/lib/utils/logger';
import type { AppError, ErrorState, ErrorHandlerOptions } from '@/lib/errors/types';

export function useErrorHandler() {
  const [error, setError] = useState<ErrorState | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast: showToast } = useToast();

  const handleError = useCallback((error: AppError) => {
    const errorState: ErrorState = {
      message: error.message,
      code: error.code || 'INTERNAL_ERROR',
      details: error.details,
      status: error.status
    };

    logger.error('Error handled:', errorState);
    showToast({
      title: errorState.code,
      description: errorState.message,
      variant: "destructive"
    });

    setError(errorState);
    return errorState;
  }, [showToast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const withErrorHandling = useCallback(
    async <T,>(
      operation: () => Promise<T>, 
      options?: ErrorHandlerOptions
    ): Promise<T | undefined> => {
      const { silent = false, retryCount = 0, retryDelay = 1000 } = options || {};
      let attempts = 0;

      const attempt = async (): Promise<T | undefined> => {
        try {
          setLoading(true);
          clearError();
          return await operation();
        } catch (error) {
          if (attempts < retryCount) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
            return attempt();
          }
          
          if (!silent) {
            handleError(error as AppError);
          }
          return undefined;
        } finally {
          setLoading(false);
        }
      };

      return attempt();
    },
    [clearError, handleError]
  );

  return {
    error,
    loading,
    handleError,
    clearError,
    withErrorHandling,
  };
}
