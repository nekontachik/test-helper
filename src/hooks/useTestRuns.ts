import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import {
  TestRun,
  TestCase,
  PaginatedResponse,
  TestCaseFormData,
  TestRunStatus,
  TestCaseStatus,
  TestCaseResult,
  TestRunFormData,
} from '@/types';

interface TestRunsResponse {
  testRuns: TestRun[];
  totalPages: number;
  currentPage: number;
}

export function useTestRuns(projectId: string, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['testRuns', projectId, page, limit],
    queryFn: () => apiClient.getTestRuns(projectId, { page, limit }),
    keepPreviousData: true,
  });
}

export function useTestRun(projectId: string, testRunId: string) {
  return useQuery({
    queryKey: ['testRun', projectId, testRunId],
    queryFn: () => apiClient.getTestRun(projectId, testRunId),
    enabled: !!projectId && !!testRunId,
  });
}

export function useCreateTestRun(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TestRunFormData) => apiClient.createTestRun(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['testRuns', projectId]);
    },
  });
}

export function useUpdateTestRun(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ testRunId, data }: { testRunId: string; data: Partial<TestRunFormData> }) => 
      apiClient.updateTestRun(projectId, testRunId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['testRuns', projectId]);
    },
  });
}

export function useDeleteTestRun(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (testRunId: string) => apiClient.deleteTestRun(projectId, testRunId),
    onSuccess: () => {
      queryClient.invalidateQueries(['testRuns', projectId]);
    },
  });
}

export function useCreateTestCase(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TestCaseFormData) => apiClient.createTestCase(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['testCases', projectId]);
    },
  });
}
