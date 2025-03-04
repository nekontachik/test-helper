import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TestRun } from '../../types';
import apiClient from '../../lib/apiClient';
import { toast } from 'react-hot-toast';
import { handleMutationError, handleToastError, logSuccess } from './mutationUtils';
import type { UpdateTestRunVariables } from './types';

/**
 * Hook to update a test run
 */
export function useUpdateTestRun(
  projectId: string,
  options: { showToasts?: boolean } = {}
): ReturnType<typeof useMutation> {
  const queryClient = useQueryClient();
  const showToasts = options.showToasts ?? true;

  return useMutation({
    mutationFn: async ({ runId, status, testCaseResults }: UpdateTestRunVariables) => {
      const startTime = performance.now();
      
      try {
        await apiClient.updateTestRun(projectId, runId, { status, testCaseResults });
        logSuccess('update test run', { projectId, runId, status, startTime });
      } catch (error) {
        handleMutationError(error as Error, 'update test run', { projectId, runId, status, startTime });
      }
    },
    onMutate: async ({ runId, status, testCaseResults }: UpdateTestRunVariables) => {
      await queryClient.cancelQueries({ queryKey: ['testRuns', projectId] });
      await queryClient.cancelQueries({ queryKey: ['testRun', projectId, runId] });

      const previousTestRun = queryClient.getQueryData(['testRun', projectId, runId]);
      const previousTestRuns = queryClient.getQueryData(['testRuns', projectId]);

      // Optimistically update the test run
      if (previousTestRun) {
        queryClient.setQueryData(['testRun', projectId, runId], {
          ...previousTestRun,
          status,
          testCaseResults,
        });
      }

      // Optimistically update the test run in the list
      if (previousTestRuns) {
        queryClient.setQueryData(
          ['testRuns', projectId],
          {
            ...previousTestRuns,
            items: previousTestRuns.items.map((run: TestRun) =>
              run.id === runId ? { ...run, status, testCaseResults } : run
            ),
          }
        );
      }

      return { previousTestRun, previousTestRuns };
    },
    onError: (error: Error, variables: UpdateTestRunVariables, context: { previousTestRun: unknown; previousTestRuns: unknown }) => {
      if (context?.previousTestRun) {
        queryClient.setQueryData(['testRun', projectId, variables.runId], context.previousTestRun);
      }
      if (context?.previousTestRuns) {
        queryClient.setQueryData(['testRuns', projectId], context.previousTestRuns);
      }
      handleToastError(error, 'update test run', showToasts);
    },
    onSuccess: (_: void, { runId }: UpdateTestRunVariables) => {
      queryClient.invalidateQueries({ queryKey: ['testRuns', projectId] });
      queryClient.invalidateQueries({ queryKey: ['testRun', projectId, runId] });
      if (showToasts) {
        toast.success('Test run updated successfully');
      }
    },
  });
} 