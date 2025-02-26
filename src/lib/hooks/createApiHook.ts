import { useQuery, useMutation } from '@tanstack/react-query';
import type { QueryObserverResult, MutationObserverResult } from '@tanstack/react-query';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

interface ApiHookConfig<TData, TInput> {
  queryKey: string[];
  url: string | ((data: TInput) => string);  // Allow both static and dynamic URLs
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
  };
}

type ApiQueryHook<TData> = () => QueryObserverResult<ApiResponse<TData>, Error>;
type ApiMutationHook<TData, TInput> = () => MutationObserverResult<ApiResponse<TData>, Error, TInput>;

export function createApiHook<TData, TInput = void>({
  queryKey,
  url,
  method = 'GET',
  options = {}
}: ApiHookConfig<TData, TInput>): ApiQueryHook<TData> | ApiMutationHook<TData, TInput> {
  const fetchData = async (input?: TInput): Promise<ApiResponse<TData>> => {
    const targetUrl = typeof url === 'function' ? url(input as TInput) : url;
    
    const response = await fetch(targetUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: input ? JSON.stringify(input) : undefined,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }

    return data;
  };

  if (method === 'GET') {
    return () => useQuery({
      queryKey,
      queryFn: () => fetchData(),
      ...options,
    });
  }

  return () => useMutation({
    mutationFn: fetchData,
    ...options,
  });
} 