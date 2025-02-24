import { useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { BaseError } from '@/lib/errors/BaseError';

export function useErrorHandler() {
  const [error, setError] = useState<BaseError | null>(null);
  const { toast } = useToast();

  const handleError = (err: Error) => {
    const baseError = err instanceof BaseError ? err : new BaseError(err.message);
    setError(baseError);
    toast({
      title: baseError.code,
      description: baseError.message,
      variant: 'destructive'
    });
  };

  const clearError = () => setError(null);

  const withErrorHandling = async <T>(
    operation: () => Promise<T>,
    _options?: { retryCount?: number; retryDelay?: number }
  ): Promise<T> => {
    try {
      return await operation();
    } catch (err) {
      handleError(err as Error);
      throw err;
    }
  };

  return { error, handleError, clearError, withErrorHandling };
} 