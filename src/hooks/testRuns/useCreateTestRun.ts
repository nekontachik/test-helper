import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TestRun } from '../../types';
import apiClient from '../../lib/apiClient';
import { toast } from 'react-hot-toast';
import { handleMutationError, handleToastError, logSuccess } from './mutationUtils';
import type { CreateTestRunVariables } from './types';

/**
 * Hook to create a test run
 */
export function useCreateTestRun(
  projectId: string,
  options: { showToasts?: boolean } = {}
): ReturnType<typeof useMutation> {
  const queryClient = useQueryClient();
  const showToasts = options.showToasts ?? true;

  return useMutation({
    mutationFn: async ({ testRun }: CreateTestRunVariables) => {
      const startTime = performance.now();
      
      try {
        await apiClient.createTestRun(projectId, testRun);
        logSuccess('create test run', { projectId, testRun, startTime });
      } catch (error) {
        handleMutationError(error as Error, 'create test run', { projectId, testRun, startTime });
      }
    },
    onMutate: async ({ testRun }: CreateTestRunVariables) => {
      await queryClient.cancelQueries({ queryKey: ['testRuns', projectId] });
      const previousTestRuns = queryClient.getQueryData(['testRuns', projectId]);

      // Optimistically add the test run to the list
      if (previousTestRuns) {
        const optimisticTestRun: TestRun = {
          id: `temp-${Date.now()}`,
          name: testRun.name,
          status: testRun.status,
          projectId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        queryClient.setQueryData(
          ['testRuns', projectId],
          {
            ...previousTestRuns,
            items: [optimisticTestRun, ...previousTestRuns.items],
            total: previousTestRuns.total + 1,
          }
        );
      }

      return { previousTestRuns };
    },
    onError: (error: Error, _: CreateTestRunVariables, context: { previousTestRuns: unknown }) => {
      if (context?.previousTestRuns) {
        queryClient.setQueryData(['testRuns', projectId], context.previousTestRuns);
      }
      handleToastError(error, 'create test run', showToasts);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testRuns', projectId] });
      if (showToasts) {
        toast.success('Test run created successfully');
      }
    },
  });
} 