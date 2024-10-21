import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { TestSuite } from '@/types';

const TEST_SUITE_QUERY_KEY = 'testSuite';
const TEST_SUITES_QUERY_KEY = 'testSuites';

export function useTestSuite(projectId: string, suiteId: string) {
  return useQuery({
    queryKey: [TEST_SUITE_QUERY_KEY, projectId, suiteId],
    queryFn: () => apiClient.getTestSuite(projectId, suiteId),
    enabled: !!projectId && !!suiteId,
  });
}

export function useUpdateTestSuite(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      suiteId,
      data,
    }: {
      suiteId: string;
      data: Partial<TestSuite>;
    }) => apiClient.updateTestSuite(projectId, suiteId, data),
    onSuccess: (
      updatedTestSuite: TestSuite,
      variables: { suiteId: string; data: Partial<TestSuite> }
    ) => {
      queryClient.setQueryData(
        [TEST_SUITE_QUERY_KEY, projectId, variables.suiteId],
        updatedTestSuite
      );
      queryClient.invalidateQueries({
        queryKey: [TEST_SUITES_QUERY_KEY, projectId],
      });
      console.log('Test suite updated successfully', updatedTestSuite);
    },
  });
}
