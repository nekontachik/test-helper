import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import type { TestCaseFormData } from '../types';

export function useUpdateTestCase(projectId: string): ReturnType<typeof useMutation> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ testCaseId, data }: { testCaseId: string; data: TestCaseFormData }) =>
      apiClient.updateTestCase(projectId, testCaseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['testCase', projectId]);
    },
  });
}
