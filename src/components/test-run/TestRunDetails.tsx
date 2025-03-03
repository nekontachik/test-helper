'use client';

import { Box, Spinner } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { useMemo, useCallback, useTransition } from 'react';
import { LazyLoad } from '@/components/common/LazyLoad';
import { TestRunErrorBoundary } from './TestRunErrorBoundary';
import { TestRunPerformanceTracker } from './TestRunPerformanceTracker';
import { useTestRun } from '@/contexts/TestRunContext';
import { useComponentPerformance } from '@/hooks/useComponentPerformance';

// Lazy load components with loading priority
const TestRunHeader = dynamic(
  () => import('@/components/test-run/TestRunHeader').then(mod => mod.TestRunHeader),
  { loading: () => <Box height="64px" /> }
);

const TestRunMetricsChart = dynamic(
  () => import('@/components/test-run/TestRunMetricsChart').then(mod => mod.TestRunMetricsChart),
  { ssr: false }
);

const TestResultList = dynamic(
  () => import('@/components/test-run/TestResultList').then(mod => mod.TestResultList),
  { 
    ssr: false,
    loading: () => <Box height="400px" />
  }
);

interface TestRunDetailsProps {
  projectId: string;
}

export function TestRunDetails({ projectId }: TestRunDetailsProps): JSX.Element {
  // Use projectId or mark as unused with underscore
  const _projectId = projectId;
  
  // Track component performance
  useComponentPerformance({
    componentName: 'TestRunDetails',
    trackRenders: true
  });
  
  return (
    <TestRunErrorBoundary>
      <TestRunPerformanceTracker 
        componentName="TestRunDetails"
        onMetricsCollected={(metrics) => {
          console.debug('TestRun Performance:', metrics);
        }}
      >
        <TestRunContent />
      </TestRunPerformanceTracker>
    </TestRunErrorBoundary>
  );
}

function TestRunContent(): JSX.Element {
  const [isPending, _startTransition] = useTransition();
  
  // Fix the TestRun type to include results property
  
  // Use the context instead of the hook directly
  const { 
    testRun,
    metrics,
    isLoading,
    isPolling
  } = useTestRun();
  
  // Get status color
  const getStatusColor = useCallback((status: string): string => {
    switch (status) {
      case 'PASSED': return 'green';
      case 'FAILED': return 'red';
      case 'IN_PROGRESS': return 'blue';
      case 'PENDING': return 'yellow';
      default: return 'gray';
    }
  }, []);
  
  // Safely access results
  const results = useMemo(() => {
    if (!testRun?.results) return [];
    return testRun.results;
  }, [testRun?.results]);

  // Handle loading state
  if (!testRun) {
    return (
      <Box height="400px" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box>
      {/* Priority content loads first */}
      <TestRunHeader 
        name={testRun.name}
        status={testRun.status}
        getStatusColor={getStatusColor}
        isLoading={isLoading || isPending}
        isPolling={isPolling}
      />

      {/* Metrics visualization */}
      <LazyLoad>
        <TestRunMetricsChart
          passRate={metrics.passRate}
          passedCount={metrics.passedCount}
          failedCount={metrics.failedCount}
          skippedCount={metrics.skippedCount}
          totalCount={metrics.totalCount}
          duration={metrics.duration}
        />
      </LazyLoad>

      {/* Results list loads last */}
      <LazyLoad height={400}>
        {isLoading || isPending ? (
          <Box height={400} display="flex" alignItems="center" justifyContent="center">
            <Spinner />
          </Box>
        ) : (
          <TestResultList
            results={results}
            height={400}
            itemSize={50}
          />
        )}
      </LazyLoad>
    </Box>
  );
} 