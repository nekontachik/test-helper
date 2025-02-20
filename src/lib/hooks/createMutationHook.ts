import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/utils/logger';

interface MutationConfig<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData) => void | Promise<void>;
  onError?: (error: Error) => void | Promise<void>;
  successMessage?: string;
  errorMessage?: string;
}

export function createMutation<TData, TVariables>({
  mutationFn,
  onSuccess,
  onError,
  successMessage = 'Operation successful',
  errorMessage = 'Operation failed'
}: MutationConfig<TData, TVariables>) {
  return (options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>) => {
    return useMutation({
      mutationFn,
      onSuccess: async (data) => {
        toast.success(successMessage);
        await onSuccess?.(data);
        await options?.onSuccess?.(data, {} as TVariables, undefined);
      },
      onError: async (error: Error) => {
        logger.error('Mutation error:', error);
        toast.error(errorMessage);
        await onError?.(error);
        await options?.onError?.(error, {} as TVariables, undefined);
      },
      ...options
    });
  };
} 