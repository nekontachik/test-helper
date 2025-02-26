import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import type { TestSuite } from '../types';

const TEST_SUITE_QUERY_KEY = 'testSuite';
const TEST_SUITES_QUERY_KEY = 'testSuites';

export function useTestSuite(projectId: string, suiteId: string): ReturnType<typeof useQuery> {
  return useQuery({
    queryKey: [TEST_SUITE_QUERY_KEY, projectId, suiteId],
    queryFn: () => apiClient.getTestSuite(projectId, suiteId),
    enabled: !!projectId && !!suiteId,
  });
}

type UpdateTestSuiteVariables = {
  suiteId: string;
  data: Partial<TestSuite>;
};

export function useUpdateTestSuite(projectId: string): ReturnType<typeof useMutation> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ suiteId, data }: UpdateTestSuiteVariables) => 
      apiClient.updateTestSuite(projectId, suiteId, data),
    onSuccess: (
      updatedTestSuite: TestSuite,
      variables: UpdateTestSuiteVariables
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
