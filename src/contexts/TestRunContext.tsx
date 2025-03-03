'use client';

import { createContext, useContext, useMemo } from 'react';
import type { TestRun } from '@/types';
import { useTestRunData } from '@/hooks/useTestRunData';
import type { calculateTestRunMetrics } from '@/utils/testRunMetrics';

interface TestRunContextValue {
  testRun: TestRun | null;
  isLoading: boolean;
  error: Error | null;
  isPolling: boolean;
  metrics: ReturnType<typeof calculateTestRunMetrics>;
  updateTestRun: (updates: Partial<TestRun>) => Promise<TestRun>;
  refreshTestRun: () => Promise<void>;
}

const TestRunContext = createContext<TestRunContextValue | null>(null);

interface TestRunProviderProps {
  children: React.ReactNode;
  projectId: string;
  runId: string;
  initialData?: TestRun;
}

export function TestRunProvider({ 
  children, 
  projectId, 
  runId, 
  initialData 
}: TestRunProviderProps): JSX.Element {
  const { 
    testRun, 
    metrics,
    isLoading, 
    error, 
    isPolling,
    refetch,
    updateTestRun: updateTestRunFn
  // @ts-expect-error - initialData can be undefined but is handled at runtime
  } = useTestRunData({
    projectId,
    runId,
    initialData,
    pollingInterval: initialData?.status === 'IN_PROGRESS' ? 5000 : 0
  });
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    testRun: testRun || null,
    isLoading,
    error: error ? (error instanceof Error ? error : new Error(String(error))) : null,
    isPolling,
    metrics,
    updateTestRun: updateTestRunFn,
    refreshTestRun: () => refetch() as Promise<void>
  }), [testRun, isLoading, error, isPolling, metrics, updateTestRunFn, refetch]);
  
  return (
    <TestRunContext.Provider value={contextValue}>
      {children}
    </TestRunContext.Provider>
  );
}

export function useTestRun(): TestRunContextValue {
  const context = useContext(TestRunContext);
  
  if (!context) {
    throw new Error('useTestRun must be used within a TestRunProvider');
  }
  
  return context;
} 