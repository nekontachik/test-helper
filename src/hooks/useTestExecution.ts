import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TestResultStatus } from '@/types/testRun';
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

interface MutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
}

interface ExecuteTestRunResponse {
  success: boolean;
  data: Record<string, unknown>;
}

export function useTestExecution(): MutationResult<ExecuteTestRunResponse, ExecuteTestRunInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, runId, results }: ExecuteTestRunInput) => {
      // Use direct URL construction
      const url = `/api/projects/${projectId}/test-runs/${runId}/execute`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to execute test run');
      }

      return response.json();
    },
    onSuccess: (_data: ExecuteTestRunResponse, variables: ExecuteTestRunInput) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['testRun', variables.projectId, variables.runId],
      });
      queryClient.invalidateQueries({
        queryKey: ['testResults', variables.runId],
      });
    },
    onError: (error: Error) => {
      logger.error('Test execution error:', error);
    },
  });
} 