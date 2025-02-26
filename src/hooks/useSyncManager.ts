import { useState, useEffect, useCallback } from 'react';
import type { SyncOperation } from '@/lib/sync/syncManager';
import { SyncManager } from '@/lib/sync/syncManager';

export function useSyncManager() {
  const [syncManager] = useState(() => new SyncManager());
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueLength, setQueueLength] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      syncManager.sync().catch(console.error);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncManager]);

  const queueOperation = useCallback(async (
    operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>
  ) => {
    await syncManager.queueOperation(operation);
    setQueueLength(prev => prev + 1);
  }, [syncManager]);

  const sync = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await syncManager.sync();
    } finally {
      setIsSyncing(false);
    }
  }, [syncManager, isSyncing]);

  return {
    queueOperation,
    sync,
    isSyncing,
    queueLength
  };
} 