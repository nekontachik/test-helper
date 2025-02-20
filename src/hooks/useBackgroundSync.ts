import { useState, useEffect, useCallback } from 'react';
import { useOfflineState } from './useOfflineState';

const SYNC_INTERVAL = 30000; // 30 seconds

export function useBackgroundSync(projectId: string, testRunId: string) {
  const { 
    isOnline, 
    pendingOperations, 
    removePendingOperation 
  } = useOfflineState(projectId, testRunId);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAttempt, setLastSyncAttempt] = useState<Date | null>(null);

  const syncOperation = useCallback(async (operation: any) => {
    try {
      if (operation.type === 'upload') {
        const response = await fetch(`/api/projects/${projectId}/uploads`, {
          method: 'POST',
          body: operation.data,
        });
        if (!response.ok) throw new Error('Upload failed');
      } else if (operation.type === 'testResult') {
        const response = await fetch(
          `/api/projects/${projectId}/test-runs/${testRunId}/results`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(operation.data),
          }
        );
        if (!response.ok) throw new Error('Result sync failed');
      }
      removePendingOperation(operation.id);
      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    }
  }, [projectId, testRunId, removePendingOperation]);

  const syncPendingOperations = useCallback(async () => {
    if (!isOnline || isSyncing || !pendingOperations.length) return;

    setIsSyncing(true);
    try {
      const results = await Promise.allSettled(
        pendingOperations.map(op => syncOperation(op))
      );
      setLastSyncAttempt(new Date());
      
      // Log sync results
      const succeeded = results.filter(r => r.status === 'fulfilled' && r.value).length;
      const failed = results.filter(r => r.status === 'rejected' || !r.value).length;
      
      if (failed > 0) {
        console.warn(`Background sync: ${succeeded} succeeded, ${failed} failed`);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, pendingOperations, syncOperation]);

  // Run background sync periodically
  useEffect(() => {
    const interval = setInterval(syncPendingOperations, SYNC_INTERVAL);
    return () => clearInterval(interval);
  }, [syncPendingOperations]);

  return {
    isSyncing,
    lastSyncAttempt,
    syncNow: syncPendingOperations,
  };
} 