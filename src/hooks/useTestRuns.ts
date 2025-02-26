import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type {
  TestRun,
  TestCaseFormData,
  TestRunFormData} from '@/types';
import { createApiHook } from '@/lib/hooks/createApiHook';
import { ROUTES } from '@/lib/routes';

export function useTestRuns(projectId: string, page: number = 1, limit: number = 10): {
  data?: {
    testRuns: TestRun[];
    totalPages: number;
    currentPage: number;
  };
  isLoading: boolean;
  error: unknown;
} {
  return useQuery({
    queryKey: ['testRuns', projectId, page, limit],
    queryFn: () => apiClient.getTestRuns(projectId, { page, limit }),
    keepPreviousData: true,
  });
}

export function useTestRun(projectId: string, runId: string): {
  data?: TestRun;
  isLoading: boolean;
  error: unknown;
} {
  return useQuery({
    queryKey: ['testRun', projectId, runId],
    queryFn: () => apiClient.getTestRun(projectId, runId),
    enabled: !!projectId && !!runId,
  });
}

export const useCreateTestRun = createApiHook<TestRun, TestRunFormData>({
  queryKey: ['testRuns', 'create'],
  url: (data) => ROUTES.API.PROJECT.TEST_RUNS.INDEX(data.projectId),
  method: 'POST',
  options: {
    onSuccess: () => {
      // Handle success
    }
  }
});

export function useUpdateTestRun(projectId: string): {
  mutate: (params: { runId: string; data: Partial<TestRunFormData> }) => Promise<TestRun>;
  isLoading: boolean;
  error: unknown;
} {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ runId, data }: { runId: string; data: Partial<TestRunFormData> }) => 
      apiClient.updateTestRun(projectId, runId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['testRuns', projectId]);
    },
  });
}

export function useDeleteTestRun(projectId: string): {
  mutate: (runId: string) => Promise<void>;
  isLoading: boolean;
  error: unknown;
} {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (runId: string) => apiClient.deleteTestRun(projectId, runId),
    onSuccess: () => {
      queryClient.invalidateQueries(['testRuns', projectId]);
    },
  });
}

export function useCreateTestCase(projectId: string): {
  mutate: (data: TestCaseFormData) => Promise<any>;
  isLoading: boolean;
  error: unknown;
} {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TestCaseFormData) => apiClient.createTestCase(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['testCases', projectId]);
    },
  });
}
