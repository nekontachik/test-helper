import { useState, useCallback } from 'react';
import { useTestRunProgress } from '@/hooks/useTestRunProgress';
import { useTestRunRecovery } from '@/hooks/useTestRunRecovery';
import { useTestRunExecution } from '@/hooks/useTestRunExecution';
import type { TestCase } from '@/types';
import type { TestResultWithEvidence } from '@/types/testResults';
import type { TestResultFormData } from '../TestResultForm';

interface UseTestRunStateProps {
  testCases: TestCase[];
  projectId: string;
  testRunId: string;
  onComplete: () => void;
}

export function useTestRunState({ 
  testCases, 
  projectId, 
  testRunId, 
  onComplete 
}: UseTestRunStateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { executeTestRun } = useTestRunExecution(projectId, testRunId);
  const { progress, updateProgress, clearProgress } = useTestRunProgress(projectId, testRunId);
  const { clearRecovery } = useTestRunRecovery(projectId, testRunId);

  const currentTestCase = testCases[progress.currentIndex];
  const isLastTestCase = progress.currentIndex === testCases.length - 1;

  const handleSubmit = useCallback(async (formData: TestResultFormData) => {
    try {
      setIsSubmitting(true);

      const result: TestResultWithEvidence = {
        testCaseId: currentTestCase.id,
        status: formData.status,
        notes: formData.notes || '',
        evidenceUrls: formData.evidenceUrls || [],
        evidence: undefined
      };

      await executeTestRun([result]);
      
      if (isLastTestCase) {
        clearProgress();
        clearRecovery();
        onComplete();
      } else {
        updateProgress({
          currentIndex: progress.currentIndex + 1,
          results: [...progress.results, result]
        });
      }
    } catch (error) {
      console.error('Failed to submit test result:', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentTestCase.id, progress, executeTestRun, isLastTestCase, clearProgress, clearRecovery, onComplete, updateProgress]);

  return {
    currentTestCase,
    isLastTestCase,
    progress,
    handleSubmit,
    isSubmitting,
    executeTestRun
  };
} 