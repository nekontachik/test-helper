import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { TestCaseFormData, TestCase } from '@/types';

export const useUpdateTestCase = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ testCaseId, data }: { testCaseId: string; data: TestCaseFormData }) =>
      apiClient.updateTestCase(projectId, testCaseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['testCase', projectId]);
    },
  });
};
