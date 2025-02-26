import { useCallback, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { logger } from '@/lib/utils/logger';
import { getErrorMessage } from '@/lib/errors/errorMessages';
import { AppError } from '@/lib/errors/types';
import type { ErrorCode } from '@/lib/errors/types';
import { ErrorRecovery } from '@/lib/errors/ErrorRecovery';
import { ErrorTracker } from '@/lib/monitoring/ErrorTracker';

interface ErrorHandlerOptions {
  silent?: boolean;
  retry?: boolean;
  retryOptions?: {
    maxAttempts?: number;
    delayMs?: number;
    backoffFactor?: number;
    timeout?: number;
  };
  track?: boolean;
  context?: string;
}

export function useErrorHandler(): {
  error: AppError | null;
  loading: boolean;
  handleError: (error: Error | AppError, options?: ErrorHandlerOptions) => void;
  clearError: () => void;
  withErrorHandling: <T>(operation: () => Promise<T>, options?: ErrorHandlerOptions) => Promise<T | undefined>;
} {
  const [error, setError] = useState<AppError | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleError = useCallback((error: Error | AppError, options?: ErrorHandlerOptions) => {
    const isAppError = error instanceof AppError;
    const errorDetails = getErrorMessage(error);
    const context = options?.context || 'Operation';

    if (options?.track) {
      ErrorTracker.track(error, context, errorDetails.severity);
    }

    logger.error(`Error in ${context}:`, {
      error: error.message,
      code: isAppError ? error.code : undefined,
      status: isAppError ? error.status : undefined,
      details: isAppError ? error.details : undefined,
      stack: error.stack
    });

    if (!options?.silent) {
      toast({
        title: errorDetails.title,
        description: errorDetails.description,
        status: errorDetails.severity,
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    }

    if (isAppError) {
      setError(error);
    } else {
      // Create a new AppError with the UNKNOWN_ERROR code
      const appError = new AppError(error.message, {
        code: 'INTERNAL_ERROR' as ErrorCode,
        status: 500
      });
      setError(appError);
    }
  }, [toast]);

  const clearError = useCallback(() => setError(null), []);

  const withErrorHandling = useCallback(
    async <T,>(operation: () => Promise<T>, options?: ErrorHandlerOptions): Promise<T | undefined> => {
      try {
        setLoading(true);
        clearError();

        if (options?.retry) {
          return await ErrorRecovery.withRetry(operation, options.retryOptions);
        }
        return await operation();
      } catch (err) {
        handleError(err as Error, options);
        return undefined;
      } finally {
        setLoading(false);
      }
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
