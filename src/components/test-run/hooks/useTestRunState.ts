import { useState, useCallback, useEffect } from 'react';
import { TestCase, TestCaseResult, TestCaseResultStatus } from '@/types';
import { useTestRunQueue } from '@/hooks/useTestRunQueue';

interface UseTestRunStateProps {
  testCases: TestCase[];
  projectId: string;
  runId: string;
  onComplete: () => void;
}

interface TestResultInput {
  status: TestCaseResultStatus;
  notes?: string;
  evidence?: string[];
}

export interface UseTestRunStateReturn {
  currentTestCase: TestCase | null;
  isLastTestCase: boolean;
  completionProgress: number;
  isSubmitting: boolean;
  error: Error | null;
  results: Record<string, TestResultInput>;
  handleSubmitResult: (result: TestResultInput) => Promise<void>;
  handleComplete: () => void;
  hasQueuedOperations: boolean;
}

export function useTestRunState({
  testCases,
  projectId,
  runId,
  onComplete
}: UseTestRunStateProps): UseTestRunStateReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [results, setResults] = useState<Record<string, TestResultInput>>({});
  const { addToQueue, processQueue, hasQueuedOperations } = useTestRunQueue(projectId, runId);

  const currentTestCase = testCases[currentIndex] || null;
  const isLastTestCase = currentIndex === testCases.length - 1;
  const completionProgress = ((currentIndex + 1) / testCases.length) * 100;

  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (navigator.onLine) {
        processQueue();
      }
    }, 30000); // Try sync every 30 seconds

    return () => clearInterval(syncInterval);
  }, [processQueue]);

  const handleSubmitResult = useCallback(async (result: TestResultInput) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Store result locally first
      setResults(prev => ({
        ...prev,
        [currentTestCase?.id]: result
      }));

      if (!navigator.onLine) {
        addToQueue(result);
        if (!isLastTestCase) {
          setCurrentIndex(prev => prev + 1);
        }
        return;
      }

      await fetch(`/api/projects/${projectId}/test-runs/${runId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testCaseId: currentTestCase?.id,
          ...result
        })
      });

      if (isLastTestCase) {
        onComplete();
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to submit result'));
    } finally {
      setIsSubmitting(false);
    }
  }, [projectId, runId, isLastTestCase, addToQueue, currentTestCase, onComplete]);

  return {
    currentTestCase,
    isLastTestCase,
    completionProgress,
    isSubmitting,
    error,
    results,
    handleSubmitResult,
    handleComplete: onComplete,
    hasQueuedOperations
  };
} 