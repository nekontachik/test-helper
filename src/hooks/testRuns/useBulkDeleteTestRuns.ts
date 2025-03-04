import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TestRun } from '../../types';
import apiClient from '../../lib/apiClient';
import { toast } from 'react-hot-toast';
import { handleMutationError, handleToastError, logSuccess } from './mutationUtils';

/**
 * Hook to bulk delete test runs
 */
export function useBulkDeleteTestRuns(
  projectId: string,
  options: { showToasts?: boolean } = {}
): ReturnType<typeof useMutation> {
  const queryClient = useQueryClient();
  const showToasts = options.showToasts ?? true;

  return useMutation({
    mutationFn: async (runIds: string[]) => {
      const startTime = performance.now();
      
      try {
        await apiClient.bulkDeleteTestRuns(projectId, runIds);
        logSuccess('bulk delete test runs', { projectId, runIds, startTime });
      } catch (error) {
        handleMutationError(error as Error, 'bulk delete test runs', { projectId, runIds, startTime });
      }
    },
    onMutate: async (runIds: string[]) => {
      await queryClient.cancelQueries({ queryKey: ['testRuns', projectId] });
      const previousTestRuns = queryClient.getQueryData(['testRuns', projectId]);

      // Optimistically remove the test runs from the list
      if (previousTestRuns) {
        queryClient.setQueryData(
          ['testRuns', projectId],
          {
            ...previousTestRuns,
            items: previousTestRuns.items.filter((run: TestRun) => !runIds.includes(run.id)),
            total: previousTestRuns.total - runIds.length,
          }
        );
      }

      return { previousTestRuns };
    },
    onError: (error: Error, runIds: string[], context: { previousTestRuns: unknown }) => {
      if (context?.previousTestRuns) {
        queryClient.setQueryData(['testRuns', projectId], context.previousTestRuns);
      }
      handleToastError(error, 'bulk delete test runs', showToasts);
    },
    onSuccess: (_: void, runIds: string[]) => {
      queryClient.invalidateQueries({ queryKey: ['testRuns', projectId] });
      // Also remove the specific test runs from cache
      runIds.forEach(runId => {
        queryClient.removeQueries({ queryKey: ['testRun', projectId, runId] });
      });
      if (showToasts) {
        toast.success('Test runs deleted successfully');
      }
    },
  });
} 