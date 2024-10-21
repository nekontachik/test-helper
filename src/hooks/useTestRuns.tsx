import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import {
  TestRun,
  PaginatedResponse,
  TestRunStatus,
  TestCaseResult,
} from '@/types';

export function useTestRuns(projectId: string, page = 1, limit = 10) {
  return useQuery<PaginatedResponse<TestRun>, Error>({
    queryKey: ['testRuns', projectId, page, limit],
    queryFn: () => apiClient.getTestRuns(projectId, page, limit),
    enabled: !!projectId,
  });
}

export function useCreateTestRun() {
  const queryClient = useQueryClient();
  return useMutation<
    TestRun,
    Error,
    { projectId: string; testRun: Partial<TestRun> }
  >({
    mutationFn: ({ projectId, testRun }) =>
      apiClient.createTestRun(projectId, testRun),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['testRuns', variables.projectId],
      });
    },
  });
}

export function useDeleteTestRun(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (testRunId) => apiClient.deleteTestRun(projectId, testRunId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testRuns', projectId] });
    },
  });
}

export function useTestRun(
  projectId: string | undefined,
  testRunId: string | undefined
) {
  return useQuery<TestRun, Error>({
    queryKey: ['testRun', projectId, testRunId],
    queryFn: () => {
      if (!projectId || !testRunId) {
        throw new Error('Project ID and Test Run ID are required');
      }
      return apiClient.getTestRun(projectId, testRunId);
    },
    enabled: !!projectId && !!testRunId,
  });
}

export function useUpdateTestRun(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<
    TestRun,
    Error,
    {
      testRunId: string;
      status: TestRunStatus;
      testCaseResults: TestCaseResult[];
    }
  >({
    mutationFn: ({ testRunId, status, testCaseResults }) =>
      apiClient.updateTestRun(projectId, testRunId, {
        status,
        testCaseResults,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['testRun', projectId, variables.testRunId],
      });
      queryClient.invalidateQueries({ queryKey: ['testRuns', projectId] });
    },
  });
}
