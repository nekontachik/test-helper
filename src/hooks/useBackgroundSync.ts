import { useState, useEffect, useCallback } from 'react';
import { useOfflineState } from './useOfflineState';

const SYNC_INTERVAL = 30000; // 30 seconds

interface UploadData {
  file: File;
  testCaseId: string;
  testRunId: string;
  index: number;
}

interface TestResultData {
  testRunId?: string;
  testCaseId?: string;
  status?: string;
  notes?: string;
  evidenceUrls?: string[];
  timestamp?: number;
}

interface SyncOperation {
  id: string;
  type: 'upload' | 'testResult';
  data: UploadData | TestResultData;
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
  retryCount: number;
}

interface BackgroundSyncResult {
  isSyncing: boolean;
  lastSyncAttempt: Date | null;
  syncNow: () => Promise<void>;
}

export function useBackgroundSync(projectId: string, testRunId: string): BackgroundSyncResult {
  const { 
    isOnline, 
    pendingOperations, 
    removePendingOperation 
  } = useOfflineState(projectId, testRunId);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAttempt, setLastSyncAttempt] = useState<Date | null>(null);

  const syncOperation = useCallback(async (operation: SyncOperation): Promise<boolean> => {
    try {
      if (operation.type === 'upload') {
        const uploadData = operation.data as UploadData;
        const formData = new FormData();
        formData.append('file', uploadData.file);
        formData.append('testCaseId', uploadData.testCaseId);
        formData.append('testRunId', uploadData.testRunId);
        formData.append('index', uploadData.index.toString());
        
        const response = await fetch(`/api/projects/${projectId}/uploads`, {
          method: 'POST',
          body: formData,
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