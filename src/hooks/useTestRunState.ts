import { useState, useCallback } from 'react';
import { useTestRunProgress } from './useTestRunProgress';
import { useTestRunRecovery } from './useTestRunRecovery';
import { useTestRunExecution } from './useTestRunExecution';
import type { TestCase } from '@/types';
import type { TestResultWithEvidence } from '@/types/testResults';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import type { TestResultFormData } from '@/lib/validations/testResult';

export function useTestRunState({ 
  testCases, 
  projectId, 
  testRunId, 
  onComplete 
}: {
  testCases: TestCase[];
  projectId: string;
  testRunId: string;
  onComplete: () => void;
}): {
  currentTestCase: TestCase | undefined;
  isLastTestCase: boolean;
  progress: {
    currentIndex: number;
    results: any[];
  };
  completionProgress: number;
  isSubmitting: boolean;
  error: string | null;
  handleSubmit: (formData: TestResultFormData) => Promise<void>;
  handleRetry: () => Promise<void>;
  isCompleted: boolean;
  handleComplete: () => Promise<void>;
  updateProgress: (updates: any) => void;
  clearProgress: () => void;
  executeTestRun: (results: TestResultWithEvidence[]) => Promise<any>;
} {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { executeTestRun } = useTestRunExecution(projectId, testRunId);
  const { progress, updateProgress, clearProgress } = useTestRunProgress(projectId, testRunId);
  const { clearRecovery } = useTestRunRecovery(projectId, testRunId);
  const router = useRouter();
  const { toast } = useToast();

  const currentTestCase = testCases[progress.currentIndex];
  const isLastTestCase = progress.currentIndex === testCases.length - 1;
  const completionProgress = ((progress.currentIndex + 1) / testCases.length) * 100;

  const handleSubmit = useCallback(async (formData: TestResultFormData) => {
    if (!currentTestCase) return;
    
    try {
      setIsSubmitting(true);
      setError(null);

      const result: TestResultWithEvidence = {
        testCaseId: currentTestCase.id,
        status: formData.status,
        notes: formData.notes || '',
        evidenceUrls: formData.evidenceUrls || []
      };

      await executeTestRun([result]);
      
      updateProgress({
        ...progress,
        results: [...progress.results, result],
        currentIndex: progress.currentIndex + 1,
      });

      if (isLastTestCase) {
        clearProgress();
        clearRecovery();
        onComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentTestCase, executeTestRun, progress, updateProgress, isLastTestCase, clearProgress, clearRecovery, onComplete]);

  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = useCallback(async () => {
    try {
      await executeTestRun(progress.results);
      setIsCompleted(true);
      clearProgress();
      clearRecovery();
      
      // Show completion dialog
      toast({
        title: "Test Run Completed",
        description: "All test cases have been executed successfully.",
        variant: "default",
        duration: 5000,
      });

      // Navigate after delay
      setTimeout(() => {
        router.push(`/projects/${projectId}/test-runs/${testRunId}/summary`);
      }, 1500);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to complete test run');
    }
  }, [executeTestRun, progress.results, clearProgress, clearRecovery, toast, router, projectId, testRunId]);

  return {
    currentTestCase,
    isLastTestCase,
    progress,
    completionProgress,
    isSubmitting,
    error,
    handleSubmit,
    handleRetry: useCallback(async () => {
      try {
        setIsSubmitting(true);
        await executeTestRun(progress.results);
        clearProgress();
        clearRecovery();
        onComplete();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to retry');
      } finally {
        setIsSubmitting(false);
      }
    }, [executeTestRun, progress.results, clearProgress, clearRecovery, onComplete]),
    isCompleted,
    handleComplete,
    updateProgress,
    clearProgress,
    executeTestRun
  };
} 