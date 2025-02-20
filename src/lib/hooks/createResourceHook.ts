import { useQuery, useMutation, QueryClient } from '@tanstack/react-query';
import { ROUTES } from '@/lib/routes';
import { ApiResult } from '@/types/api';

export function createResourceHook<T, TInput = void>(
  resource: string,
  queryClient: QueryClient
) {
  return {
    useGet: (id: string) => 
      useQuery<ApiResult<T>>({
        queryKey: [resource, id],
        queryFn: () => fetch(ROUTES.API[resource](id)).then(r => r.json())
      }),

    useList: () => 
      useQuery<ApiResult<T[]>>({
        queryKey: [resource],
        queryFn: () => fetch(ROUTES.API[resource].LIST()).then(r => r.json())
      }),

    useCreate: () =>
      useMutation<ApiResult<T>, Error, TInput>({
        mutationFn: (input) => 
          fetch(ROUTES.API[resource].CREATE(), {
            method: 'POST',
            body: JSON.stringify(input)
          }).then(r => r.json()),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [resource] });
        }
      })
  };
} 