import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TestRun } from '../../types';
import apiClient from '../../lib/apiClient';
import { toast } from 'react-hot-toast';
import { handleMutationError, handleToastError, logSuccess } from './mutationUtils';

/**
 * Hook to delete a test run
 */
export function useDeleteTestRun(
  projectId: string,
  options: { showToasts?: boolean } = {}
): ReturnType<typeof useMutation> {
  const queryClient = useQueryClient();
  const showToasts = options.showToasts ?? true;
  
  return useMutation({
    mutationFn: async (runId: string) => {
      const startTime = performance.now();
      
      try {
        await apiClient.deleteTestRun(projectId, runId);
        logSuccess('delete test run', { projectId, runId, startTime });
      } catch (error) {
        handleMutationError(error as Error, 'delete test run', { projectId, runId, startTime });
      }
    },
    onMutate: async (runId: string) => {
      await queryClient.cancelQueries({ queryKey: ['testRuns', projectId] });
      const previousTestRuns = queryClient.getQueryData(['testRuns', projectId]);

      // Optimistically remove the test run from the list
      if (previousTestRuns) {
        queryClient.setQueryData(
          ['testRuns', projectId],
          {
            ...previousTestRuns,
            items: previousTestRuns.items.filter((run: TestRun) => run.id !== runId),
            total: previousTestRuns.total - 1,
          }
        );
      }

      return { previousTestRuns };
    },
    onError: (error: Error, runId: string, context: { previousTestRuns: unknown }) => {
      if (context?.previousTestRuns) {
        queryClient.setQueryData(['testRuns', projectId], context.previousTestRuns);
      }
      handleToastError(error, 'delete test run', showToasts);
    },
    onSuccess: (_: void, runId: string) => {
      queryClient.invalidateQueries({ queryKey: ['testRuns', projectId] });
      // Also remove the specific test run from cache
      queryClient.removeQueries({ queryKey: ['testRun', projectId, runId] });
      if (showToasts) {
        toast.success('Test run deleted successfully');
      }
    },
  });
} 