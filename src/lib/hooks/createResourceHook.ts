import { useQuery, useMutation } from '@tanstack/react-query';
import { ROUTES } from '@/lib/routes';
import type { ApiSuccessResponse } from '@/types/api';

type ResourceKey = 'TEST_RUNS' | 'TEST_CASES' | 'TEST_REPORTS';

export function createResourceHook<T, TInput = void>(
  resource: ResourceKey,
  queryClient: { invalidateQueries: (options: { queryKey: unknown[] }) => void },
  projectId: string
): {
  useGet: (id: string) => {
    data: ApiSuccessResponse<T> | undefined;
    error: Error | null;
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
  };
  useList: () => {
    data: ApiSuccessResponse<T[]> | undefined;
    error: Error | null;
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
  };
  useCreate: () => {
    mutate: (variables: TInput) => void;
    mutateAsync: (variables: TInput) => Promise<ApiSuccessResponse<T>>;
    isLoading: boolean;
    error: Error | null;
    data: ApiSuccessResponse<T> | undefined;
  };
} {
  const resourceRoutes = ROUTES.API.PROJECT[resource];
  
  if (!('INDEX' in resourceRoutes && 'SHOW' in resourceRoutes)) {
    throw new Error(`Invalid resource: ${resource}`);
  }

  return {
    useGet: (id: string) => 
      useQuery({
        queryKey: [resource, id],
        queryFn: () => fetch(resourceRoutes.SHOW(projectId, id)).then(r => r.json())
      }),

    useList: () => 
      useQuery({
        queryKey: [resource],
        queryFn: () => fetch(resourceRoutes.INDEX(projectId)).then(r => r.json())
      }),

    useCreate: () =>
      useMutation({
        mutationFn: (input: TInput) => 
          fetch(resourceRoutes.INDEX(projectId), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(input)
          }).then(r => r.json()),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [resource] });
        }
      })
  };
} 