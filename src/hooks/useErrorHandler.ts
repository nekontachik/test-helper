import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { logger } from '@/lib/utils/logger';

interface ErrorState {
  message: string;
  code?: string;
  details?: unknown;
  status?: number;
}

export function useErrorHandler() {
  const [error, setError] = useState<ErrorState | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast: showToast } = useToast();

  const handleError = (error: Error & { code?: string; details?: unknown; status?: number }) => {
    const errorState: ErrorState = {
      message: error.message,
      code: error.code || error.name,
      details: error.details,
      status: error.status
    };

    logger.error('Error handled:', errorState);
    showToast({
      title: errorState.code || 'Error',
      description: errorState.message,
      variant: "destructive"
    });

    return errorState;
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const withErrorHandling = useCallback(
    async <T,>(operation: () => Promise<T>, options?: {
      silent?: boolean;
      retryCount?: number;
      retryDelay?: number;
    }): Promise<T | undefined> => {
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
            handleError(error as Error);
          }
          return undefined;
        } finally {
          setLoading(false);
        }
      };

      return attempt();
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
