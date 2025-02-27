import { useState, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';
import { TestResultError } from '@/lib/errors/specific/testErrors';
import type { TestResultFormData } from '@/lib/validations/testResult';

interface TestResultResponse {
  success: boolean;
  data?: Record<string, unknown>;
}

export function useTestRunManager(projectId: string, testRunId: string): { 
  isSubmitting: boolean;
  submitTestResult: (data: TestResultFormData) => Promise<TestResultResponse>;
} {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { withErrorHandling } = useErrorHandler();

  const submitTestResult = useCallback(async (data: TestResultFormData) => {
    return withErrorHandling(async () => {
      setIsSubmitting(true);
      try {
        const response = await fetch(
          `/api/projects/${projectId}/test-runs/${testRunId}/results`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new TestResultError(error.message || 'Failed to submit test result', {
            status: response.status,
            details: error.details,
          });
        }

        return await response.json();
      } finally {
        setIsSubmitting(false);
      }
    });
  }, [projectId, testRunId, withErrorHandling]);

  return {
    isSubmitting,
    submitTestResult,
  };
} 