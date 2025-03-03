import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';
import { TestRun } from '@/types';
import { fetchTestRun } from '@/services/testRunService';
import { calculateTestRunMetrics } from '@/utils/testRunMetrics';

interface UseTestRunDataOptions {
  projectId: string;
  runId: string;
  initialData?: TestRun;
  pollingInterval?: number;
}

export function useTestRunData({
  projectId,
  runId,
  initialData,
  pollingInterval = 0
}: UseTestRunDataOptions) {
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
    queryFn: () => fetchTestRun(projectId, runId),
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
      refetch();
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
      queryClient.prefetchQuery({
        queryKey: ['testCases', projectId, { testRunId: runId }],
        queryFn: () => fetchTestCases(projectId, { testRunId: runId }),
      });
    }
  }, [projectId, runId, testRun?.id, queryClient]);
  
  // Optimized update function
  const updateTestRun = useCallback(async (updates: Partial<TestRun>) => {
    // Optimistic update
    queryClient.setQueryData(['testRun', projectId, runId], (old: TestRun | undefined) => {
      if (!old) return old;
      return { ...old, ...updates, updatedAt: new Date().toISOString() };
    });
    
    // Actual update
    try {
      const updated = await updateTestRunApi(projectId, runId, updates);
      return updated;
    } catch (error) {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['testRun', projectId, runId] });
      throw error;
    }
  }, [projectId, runId, queryClient]);
  
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