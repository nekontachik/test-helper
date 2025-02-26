import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import type { TestSuite, TestSuiteFormData } from '../types';

const TEST_SUITES_QUERY_KEY = 'testSuites';

export function useTestSuites(projectId: string): ReturnType<typeof useQuery> {
  return useQuery({
    queryKey: [TEST_SUITES_QUERY_KEY, projectId],
    queryFn: () => apiClient.getTestSuites(projectId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateTestSuite(projectId: string): ReturnType<typeof useMutation> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTestSuite: TestSuiteFormData) =>
      apiClient.createTestSuite(projectId, newTestSuite),
    onSuccess: (newTestSuite: TestSuite) => {
      queryClient.setQueryData([TEST_SUITES_QUERY_KEY, projectId], 
        (oldData: TestSuite[] | undefined) => oldData ? [...oldData, newTestSuite] : [newTestSuite]
      );
      queryClient.invalidateQueries({
        queryKey: [TEST_SUITES_QUERY_KEY, projectId],
      });
    },
  });
}
