'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Box, Spinner, Text } from '@chakra-ui/react';
import { ErrorBoundary } from 'react-error-boundary';
import { TestRunProvider } from '@/contexts/TestRunContext';
import { TestRunDetails } from '@/components/test-run/TestRunDetails';
import { useComponentPerformance } from '@/hooks/useComponentPerformance';

// Fallback component for error boundary
function ErrorFallback({ error }: { error: Error }): JSX.Element {
  return (
    <Box p={4} bg="red.50" borderRadius="md">
      <Text color="red.500" fontWeight="bold">Error loading test run:</Text>
      <Text color="red.700">{error.message}</Text>
    </Box>
  );
}

// Loading component
function LoadingFallback(): JSX.Element {
  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      height="50vh"
    >
      <Spinner size="xl" />
    </Box>
  );
}

// Main component with performance tracking
function TestRunPage(): JSX.Element {
  const params = useParams();
  const projectId = params.projectId as string;
  const runId = params.runId as string;
  
  // Track component performance
  useComponentPerformance({
    componentName: 'TestRunPage',
    trackInteractions: true,
    trackRenders: true
  });
  
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <TestRunProvider
        projectId={projectId}
        runId={runId}
      >
        <Suspense fallback={<LoadingFallback />}>
          <TestRunDetails projectId={projectId} />
        </Suspense>
      </TestRunProvider>
    </ErrorBoundary>
  );
}

export default TestRunPage; 