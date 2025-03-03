import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';
import type { TestRun } from '@/types';
import { getTestRunDetails as fetchTestRun } from '@/lib/services/testRunService';
import { calculateTestRunMetrics } from '@/utils/testRunMetrics';

// Import the missing services
import { testCaseService } from '@/services/TestCaseService';

interface UseTestRunDataOptions {
  projectId: string;
  runId: string;
  initialData?: TestRun;
  pollingInterval?: number;
}

interface TestRunQueryResult {
  testRun: TestRun | undefined;
  metrics: ReturnType<typeof calculateTestRunMetrics>;
  isLoading: boolean;
  error: unknown;
  isPolling: boolean;
  refetch: () => Promise<unknown>;
  updateTestRun: (updates: Partial<TestRun>) => Promise<TestRun>;
}

export function useTestRunData({
  projectId,
  runId,
  initialData,
  pollingInterval = 0
}: UseTestRunDataOptions): TestRunQueryResult {
  const queryClient = useQueryClient();
  const [isPolling, setIsPolling] = useState(false);
  
  // Use optimistic updates for better UX
  const {
    data: testRun,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['testRun', projectId, runId],
    queryFn: () => fetchTestRun(runId).then(response => {
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to fetch test run');
    }),
    initialData,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
  
  // Memoize metrics calculation to avoid recalculation on every render
  const metrics = calculateTestRunMetrics(testRun);
  
  // Set up polling if needed (for in-progress test runs)
  useEffect(() => {
    if (!pollingInterval || !testRun || testRun.status !== 'IN_PROGRESS') {
      setIsPolling(false);
      return;
    }
    
    setIsPolling(true);
    const intervalId = setInterval(() => {
      void refetch();
    }, pollingInterval);
    
    return () => {
      clearInterval(intervalId);
      setIsPolling(false);
    };
  }, [pollingInterval, refetch, testRun]);
  
  // Prefetch related data
  useEffect(() => {
    if (testRun?.id) {
      // Prefetch test cases for this run
      if (pollingInterval > 0) {
        void queryClient.prefetchQuery({
          queryKey: ['testCases', projectId, { testRunId: runId }],
          queryFn: () => testCaseService.findByProject(projectId),
        });
      }
    }
  }, [projectId, runId, testRun?.id, queryClient, pollingInterval]);
  
  // Update function
  const updateTestRun = useCallback(
    async (updates: Partial<TestRun>): Promise<TestRun> => {
      if (!testRun?.id) {
        throw new Error('Cannot update test run: No test run loaded');
      }

      try {
        // Call API to update test run
        const response = await fetch(`/api/projects/${projectId}/test-runs/${runId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error('Failed to update test run');
        }

        const updatedTestRun = await response.json();
        
        // Update cache
        queryClient.setQueryData(['testRun', projectId, runId], updatedTestRun);
        
        return updatedTestRun;
      } catch (error) {
        console.error('Error updating test run:', error);
        throw error;
      }
    },
    [projectId, runId, testRun?.id, queryClient]
  );
  
  return {
    testRun,
    metrics,
    isLoading,
    error,
    isPolling,
    refetch,
    updateTestRun
  };
} 