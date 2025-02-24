import { useQuery } from '@tanstack/react-query';

type QueryKey = readonly unknown[];

interface QueryResult<TData> {
  data: TData | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface QueryOptions<TData> {
  queryKey: unknown[];
  queryFn: () => Promise<TData>;
  enabled?: boolean;
}

interface QueryHookOptions<TData, TParams> {
  queryKey: (params: TParams) => QueryKey;
  queryFn: (params: TParams) => Promise<TData>;
  enabled?: (params: TParams) => boolean;
}

export function createTypedQueryHook<TData, TParams>(
  options: QueryHookOptions<TData, TParams>
) {
  return function useTypedQuery(
    params: TParams,
    queryOptions?: Partial<QueryOptions<TData>>
  ): QueryResult<TData> {
    const query = useQuery({
      queryKey: options.queryKey(params),
      queryFn: () => options.queryFn(params),
      enabled: options.enabled ? options.enabled(params) : true,
      ...queryOptions,
    });

    return {
      data: query.data,
      isLoading: query.isLoading,
      error: query.error as Error | null,
      refetch: async () => {
        await query.refetch();
      },
    };
  };
} 