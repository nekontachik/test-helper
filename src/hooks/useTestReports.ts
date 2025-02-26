import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { TestReport, TestReportFormData } from '@/types';

export function useTestReports(projectId: string) {
  return useQuery({
    queryKey: ['testReports', projectId],
    queryFn: () => apiClient.getTestReports(projectId),
  });
}

export function useCreateTestReport() {
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
