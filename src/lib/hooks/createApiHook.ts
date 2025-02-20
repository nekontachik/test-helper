import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { ApiResult, ApiError } from '@/types/api';

interface ApiHookConfig<TData, TInput> {
  queryKey: string[];
  url: string | ((data: TInput) => string);  // Allow both static and dynamic URLs
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
  };
}

export function createApiHook<TData, TInput = void>({
  queryKey,
  url,
  method = 'GET',
  options = {}
}: ApiHookConfig<TData, TInput>) {
  const fetchData = async (input?: TInput): Promise<ApiResult<TData>> => {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: input ? JSON.stringify(input) : undefined,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new ApiError(data.error.message, data.error.code);
    }

    return data;
  };

  if (method === 'GET') {
    return () => useQuery<ApiResult<TData>>({
      queryKey,
      queryFn: () => fetchData(),
      ...options,
    });
  }

  return () => useMutation<ApiResult<TData>, ApiError, TInput>({
    mutationFn: fetchData,
    ...options,
  });
} 