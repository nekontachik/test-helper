import { useMutation } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';

interface MutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  error: Error | null;
  data: TData | undefined;
}

interface MutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
}

interface MutationHookOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: TData, variables: TVariables) => void;
}

export function createMutation<TData, TVariables>(
  options: MutationHookOptions<TData, TVariables>
) {
  return function useTypedMutation(
    mutationOptions?: Partial<MutationOptions<TData, TVariables>>
  ): MutationResult<TData, TVariables> {
    const toast = useToast();

    const mutation = useMutation({
      mutationFn: options.mutationFn,
      onSuccess(data: TData, variables: TVariables) {
        if (options.successMessage) {
          toast({
            title: options.successMessage,
            status: 'success',
            duration: 3000,
          });
        }
        options.onSuccess?.(data, variables);
        mutationOptions?.onSuccess?.(data, variables);
      },
      onError(error: Error, variables: TVariables) {
        toast({
          title: options.errorMessage || 'An error occurred',
          description: error.message,
          status: 'error',
          duration: 5000,
        });
        mutationOptions?.onError?.(error, variables);
      },
    });

    return {
      mutate: mutation.mutate,
      mutateAsync: mutation.mutateAsync,
      isLoading: mutation.isPending,
      error: mutation.error as Error | null,
      data: mutation.data,
    };
  };
} 