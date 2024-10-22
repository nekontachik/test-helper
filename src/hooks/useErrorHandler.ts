import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/toast';

interface ErrorState {
  message: string;
  code?: string;
}

export function useErrorHandler() {
  const [error, setError] = useState<ErrorState | null>(null);
  const toast = useToast();

  const handleError = useCallback((error: unknown) => {
    let errorState: ErrorState;

    if (error instanceof Error) {
      errorState = {
        message: error.message,
        code: (error as any).code,
      };
    } else if (typeof error === 'string') {
      errorState = { message: error };
    } else {
      errorState = { message: 'An unexpected error occurred' };
    }

    setError(errorState);

    toast({
      title: 'Error',
      description: errorState.message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  }, [toast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}
