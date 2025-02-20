import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { QueryOptions } from '@/lib/db/queryBuilder';
import { ApiError } from '@/lib/api/errorHandler';
import { logger } from '@/lib/utils/logger';

interface QueryHookConfig<T, TParams> {
  queryKey: (params: TParams) => string[];
  queryFn: (params: TParams, queryOptions: QueryOptions<T>) => Promise<T[]>;
  defaultOptions?: QueryOptions<T>;
  enabled?: (params: TParams) => boolean;
}

export function createTypedQueryHook<T extends Record<string, any>, TParams = void>(
  config: QueryHookConfig<T, TParams>
) {
  return (
    params: TParams,
    queryOptions: QueryOptions<T> = {},
    options: Omit<UseQueryOptions<T[], ApiError>, 'queryKey' | 'queryFn'> = {}
  ) => {
    const mergedQueryOptions = {
      ...config.defaultOptions,
      ...queryOptions,
    };

    return useQuery<T[], ApiError>({
      queryKey: [...config.queryKey(params), mergedQueryOptions],
      queryFn: async () => {
        try {
          return await config.queryFn(params, mergedQueryOptions);
        } catch (error) {
          logger.error('Query error:', { error, params, queryOptions });
          throw error instanceof ApiError ? error : new ApiError('Unexpected error occurred');
        }
      },
      enabled: config.enabled?.(params),
      ...options,
    });
  };
} 