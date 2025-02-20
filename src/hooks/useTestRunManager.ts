import { useState, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';
import { TestResultError } from '@/lib/errors/specific/testErrors';
import type { TestResultFormData } from '@/lib/validations/testResult';

export function useTestRunManager(projectId: string, testRunId: string) {
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
    }, {
      retryCount: 2,
      retryDelay: 1000
    });
  }, [projectId, testRunId, withErrorHandling]);

  return {
    isSubmitting,
    submitTestResult,
  };
} 