import { useState, useEffect, useCallback } from 'react';
import { TestCaseResultStatus } from '@/types';

interface TestResultInput {
  status: TestCaseResultStatus;
  notes?: string;
  evidence?: string[];
  testCaseId?: string;
}

interface QueuedOperation {
  type: 'TEST_RESULT';
  data: TestResultInput;
  timestamp: number;
  retryCount: number;
}

export function useTestRunQueue(projectId: string, runId: string) {
  const queueKey = `test-run-queue:${projectId}:${runId}`;
  const [operations, setOperations] = useState<QueuedOperation[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(queueKey);
    return saved ? JSON.parse(saved) : [];
  });

  const addToQueue = useCallback((data: TestResultInput) => {
    const operation: QueuedOperation = {
      type: 'TEST_RESULT',
      data,
      timestamp: Date.now(),
      retryCount: 0
    };
    setOperations(prev => {
      const updated = [...prev, operation];
      localStorage.setItem(queueKey, JSON.stringify(updated));
      return updated;
    });
  }, [queueKey]);

  const processQueue = useCallback(async () => {
    if (!navigator.onLine || !operations.length) return;

    const operation = operations[0];
    try {
      await fetch(`/api/projects/${projectId}/test-runs/${runId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(operation.data)
      });

      setOperations(prev => {
        const updated = prev.slice(1);
        localStorage.setItem(queueKey, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      if (operation.retryCount < 3) {
        setOperations(prev => {
          const updated = [
            { ...operation, retryCount: operation.retryCount + 1 },
            ...prev.slice(1)
          ];
          localStorage.setItem(queueKey, JSON.stringify(updated));
          return updated;
        });
      }
    }
  }, [operations, projectId, runId, queueKey]);

  return {
    addToQueue,
    processQueue,
    hasQueuedOperations: operations.length > 0,
    queueLength: operations.length
  };
} 