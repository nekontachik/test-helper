import { useQuery } from '@tanstack/react-query';

// Define the types we need
type QueryKey = readonly unknown[];

interface UseQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> {
  queryKey: TQueryKey;
  queryFn: () => Promise<TQueryFnData>;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  // Add other options as needed
}

interface UseQueryResult<TData = unknown, TError = unknown> {
  data: TData | undefined;
  error: TError | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  // Add other properties as needed
}

export function useQueryWrapper<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  queryFn: () => Promise<TQueryFnData>,
  options?: Omit<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    'queryKey' | 'queryFn'
  >
): UseQueryResult<TData, TError> {
  return useQuery({
    queryKey,
    queryFn,
    ...options,
  });
}
