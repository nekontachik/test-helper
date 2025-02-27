import { useState, useEffect, useCallback } from 'react';
import type { SyncOperation } from '@/lib/sync/syncManager';
import { SyncManager } from '@/lib/sync/syncManager';

interface SyncManagerResult {
  queueOperation: (operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>) => Promise<void>;
  sync: () => Promise<void>;
  isSyncing: boolean;
  queueLength: number;
}

export function useSyncManager(): SyncManagerResult {
  const [syncManager] = useState(() => new SyncManager());
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueLength, setQueueLength] = useState(0);

  useEffect(() => {
    const handleOnline = (): void => {
      syncManager.sync().catch(console.error);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncManager]);

  const queueOperation = useCallback(async (
    operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>
  ): Promise<void> => {
    await syncManager.queueOperation(operation);
    setQueueLength(prev => prev + 1);
  }, [syncManager]);

  const sync = useCallback(async (): Promise<void> => {
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