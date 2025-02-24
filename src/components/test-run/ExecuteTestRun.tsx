'use client';

import { VStack, Box, useToast } from '@chakra-ui/react';
import { useTestRunState } from './hooks/useTestRunState';
import { TestRunHeader } from './TestRunHeader';
import { TestResultForm } from './TestResultForm';
import { OfflineIndicator } from './OfflineIndicator';
import { useRouter } from 'next/navigation';
import type { TestRun } from '@/types';
import type { TestResult } from '@/types/testResults';

interface ExecuteTestRunProps {
  testRun: TestRun;
  projectId: string;
  runId: string;
}

interface TestResultFormProps {
  testCaseId: string;
  runId: string;
  projectId: string;
  isSubmitting: boolean;
  isLastCase: boolean;
  onSubmit: (result: TestResult) => Promise<void>;
  onSuccess: (data: Record<string, any>) => Promise<void>;
}

export function ExecuteTestRun({ testRun, projectId, runId }: ExecuteTestRunProps) {
  const router = useRouter();
  const toast = useToast();
  
  const {
    currentTestCase,
    isLastTestCase,
    completionProgress,
    isSubmitting,
    error,
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

  const handleSuccess = async (data: Record<string, any>) => {
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
          onSubmit={handleSubmitResult}
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