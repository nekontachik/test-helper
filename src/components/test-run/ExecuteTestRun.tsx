'use client';

import { VStack, Box, useToast } from '@chakra-ui/react';
import { useTestRunState } from './hooks/useTestRunState';
import { TestRunHeader } from './TestRunHeader';
import { TestResultForm } from './TestResultForm';
import { OfflineIndicator } from './OfflineIndicator';
import { useRouter } from 'next/navigation';
import type { TestRun } from '@/types';
import type { TestResultFormData } from '@/lib/validations/testResult';

interface ExecuteTestRunProps {
  testRun: TestRun;
  projectId: string;
  runId: string;
}

export function ExecuteTestRun({ testRun, projectId, runId }: ExecuteTestRunProps): JSX.Element | null {
  const router = useRouter();
  const toast = useToast();
  
  const {
    currentTestCase,
    isLastTestCase,
    completionProgress,
    isSubmitting,
    error: _error,
    handleSubmitResult,
    handleComplete,
    hasQueuedOperations
  } = useTestRunState({
    testCases: testRun.testCases || [],
    projectId,
    runId,
    onComplete: () => {
      toast({
        title: 'Test Run Completed',
        description: 'All test cases have been executed.',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      router.push(`/projects/${projectId}/test-runs/${runId}`);
    }
  });

  if (!currentTestCase) {
    return null;
  }

  const handleSuccess = async (_data: TestResultFormData): Promise<void> => {
    await handleComplete();
    return Promise.resolve();
  };

  return (
    <VStack spacing={6} align="stretch">
      <TestRunHeader 
        currentIndex={testRun.testCases?.indexOf(currentTestCase) ?? 0}
        totalCases={testRun.testCases?.length ?? 0}
        progress={completionProgress}
      />
      
      <Box>
        <TestResultForm
          testCaseId={currentTestCase.id}
          runId={runId}
          projectId={projectId}
          isSubmitting={isSubmitting}
          isLastCase={isLastTestCase}
          onSubmit={handleSubmitResult as unknown as (data: TestResultFormData) => Promise<void>}
          onSuccess={handleSuccess}
        />
      </Box>

      <OfflineIndicator
        isOnline={navigator.onLine}
        hasQueuedOperations={hasQueuedOperations}
        hasPendingOperations={false}
        isProcessing={isSubmitting}
        isSyncing={false}
        queueLength={0}
        pendingOperations={[]}
        onSync={() => {}}
      />
    </VStack>
  );
} 