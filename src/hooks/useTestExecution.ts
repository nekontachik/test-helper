import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TestResultStatus } from '@/types/testRun';
import { ROUTES } from '@/lib/routes';
import { logger } from '@/lib/utils/logger';

interface ExecuteTestRunInput {
  projectId: string;
  runId: string;
  results: {
    testCaseId: string;
    status: TestResultStatus;
    notes?: string;
  }[];
}

export function useTestExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, runId, results }: ExecuteTestRunInput) => {
      const response = await fetch(
        ROUTES.API.PROJECT.TEST_RUNS.EXECUTE(projectId, runId),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ results }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to execute test run');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['testRun', variables.projectId, variables.runId],
      });
      queryClient.invalidateQueries({
        queryKey: ['testResults', variables.runId],
      });
    },
    onError: (error) => {
      logger.error('Test execution error:', error);
    },
  });
} 