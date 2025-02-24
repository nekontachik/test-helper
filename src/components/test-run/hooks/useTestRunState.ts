import { useState, useCallback, useEffect } from 'react';
import { TestCase, TestResult } from '@/types';
import { useTestRunQueue } from '@/hooks/useTestRunQueue';

interface UseTestRunStateProps {
  testCases: TestCase[];
  projectId: string;
  runId: string;
  onComplete: () => void;
}

export interface UseTestRunStateReturn {
  currentTestCase: TestCase | null;
  isLastTestCase: boolean;
  completionProgress: number;
  isSubmitting: boolean;
  error: Error | null;
  handleSubmitResult: (result: TestResult) => Promise<void>;
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
  const { addToQueue, processQueue, hasQueuedOperations } = useTestRunQueue(projectId, runId);

  const currentTestCase = testCases[currentIndex] || null;
  const isLastTestCase = currentIndex === testCases.length - 1;
  const completionProgress = ((currentIndex + 1) / testCases.length) * 100;

  useEffect(() => {
    window.addEventListener('online', processQueue);
    return () => window.removeEventListener('online', processQueue);
  }, [processQueue]);

  const handleSubmitResult = useCallback(async (result: TestResult) => {
    try {
      setIsSubmitting(true);
      setError(null);

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
        body: JSON.stringify(result)
      });

      if (!isLastTestCase) {
        setCurrentIndex(prev => prev + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to submit result'));
    } finally {
      setIsSubmitting(false);
    }
  }, [projectId, runId, isLastTestCase, addToQueue]);

  return {
    currentTestCase,
    isLastTestCase,
    completionProgress,
    isSubmitting,
    error,
    handleSubmitResult,
    handleComplete: onComplete,
    hasQueuedOperations
  };
} 