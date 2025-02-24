import { useState, useCallback, useEffect } from 'react';
import { addTestResult, getTestResults, clearTestResults } from '@/lib/storage/indexedDB';
import { useOnlineStatus } from './useOnlineStatus';

interface QueuedTestResult {
  id: string;
  testCaseId: string;
  status: string;
  notes?: string;
  timestamp: number;
}

export function useTestResultQueue(projectId: string, runId: string) {
  const [queuedResults, setQueuedResults] = useState<QueuedTestResult[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const isOnline = useOnlineStatus();

  // Load queued results from IndexedDB
  useEffect(() => {
    getTestResults().then(results => setQueuedResults(results));
  }, []);

  // Add a result to the queue
  const enqueueResult = useCallback(async (result: Omit<QueuedTestResult, 'timestamp'>) => {
    const queuedResult = {
      ...result,
      timestamp: Date.now()
    };
    await addTestResult(queuedResult);
    setQueuedResults(prev => [...prev, queuedResult]);
  }, []);

  // Process the queue
  const processQueue = useCallback(async () => {
    if (!isOnline || isSyncing || !queuedResults.length) return;

    setIsSyncing(true);
    try {
      for (const result of queuedResults) {
        try {
          await fetch(`/api/projects/${projectId}/test-runs/${runId}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result)
          });
          setQueuedResults(prev => prev.filter(r => r.id !== result.id));
        } catch (error) {
          console.error('Failed to sync result:', error);
        }
      }
      await clearTestResults();
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, queuedResults, projectId, runId]);

  // Auto-sync when online
  useEffect(() => {
    if (isOnline && queuedResults.length > 0) {
      processQueue();
    }
  }, [isOnline, queuedResults.length, processQueue]);

  return {
    queuedResults,
    enqueueResult,
    processQueue,
    isSyncing,
    queueLength: queuedResults.length
  };
} 