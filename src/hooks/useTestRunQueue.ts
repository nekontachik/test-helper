import { useState, useEffect } from 'react';
import { TestResult } from '@/types';

interface QueuedOperation {
  testResult: TestResult;
  projectId: string;
  runId: string;
  timestamp: number;
}

const QUEUE_KEY = 'test-run-queue';

export function useTestRunQueue(projectId: string, runId: string) {
  const [queue, setQueue] = useState<QueuedOperation[]>(() => {
    try {
      const saved = localStorage.getItem(QUEUE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }, [queue]);

  const addToQueue = (testResult: TestResult) => {
    setQueue(prev => [...prev, {
      testResult,
      projectId,
      runId,
      timestamp: Date.now()
    }]);
  };

  const removeFromQueue = (timestamp: number) => {
    setQueue(prev => prev.filter(op => op.timestamp !== timestamp));
  };

  const processQueue = async () => {
    if (!navigator.onLine) return;

    for (const operation of queue) {
      try {
        await fetch(`/api/projects/${operation.projectId}/test-runs/${operation.runId}/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(operation.testResult)
        });
        removeFromQueue(operation.timestamp);
      } catch (error) {
        console.error('Failed to process queued operation:', error);
      }
    }
  };

  return {
    queue,
    addToQueue,
    removeFromQueue,
    processQueue,
    hasQueuedOperations: queue.length > 0
  };
} 