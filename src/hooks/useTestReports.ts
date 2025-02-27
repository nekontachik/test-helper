import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { TestReport, TestReportFormData } from '@/types';

interface QueryResult<T> {
  data?: T;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<{data: T}>;
}

interface MutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
}

export function useTestReports(projectId: string): QueryResult<TestReport[]> {
  return useQuery({
    queryKey: ['testReports', projectId],
    queryFn: () => apiClient.getTestReports(projectId),
  });
}

export function useCreateTestReport(): MutationResult<TestReport, TestReportFormData> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TestReportFormData) =>
      apiClient.createTestReport(data.projectId, data),
    onSuccess: (
      newTestReport: TestReport,
      variables: TestReportFormData
    ) => {
      queryClient.invalidateQueries({
        queryKey: ['testReports', variables.projectId],
      });
    },
  });
}
