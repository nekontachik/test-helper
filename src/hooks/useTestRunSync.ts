import { useState, useEffect, useCallback } from 'react';
import { useOfflineState } from './useOfflineState';
import { useBackgroundSync } from './useBackgroundSync';
import { useOperationQueue } from './useOperationQueue';
import { useQueueProcessor } from './useQueueProcessor';
import type { QueuedOperation, OperationType} from '@/types/operations';
import { OperationPriority } from '@/types/operations';

export function useTestRunSync(projectId: string, testRunId: string): {
  isOnline: boolean;
  queueOperation: <T extends OperationType>(operation: Omit<QueuedOperation<T>, 'id' | 'timestamp' | 'retryCount'>) => QueuedOperation<T> | undefined;
  hasQueuedOperations: boolean;
  hasPendingOperations: boolean;
  isProcessing: boolean;
  isSyncing: boolean;
  queueLength: number;
  pendingOperations: unknown[];
  syncNow: () => Promise<void>;
} {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { 
    hasPendingOperations, 
    pendingOperations 
  } = useOfflineState(projectId, testRunId);
  const { isSyncing, syncNow } = useBackgroundSync(projectId, testRunId);
  const { hasOperations: hasQueuedOperations } = useOperationQueue(projectId);
  const { isProcessing, queueLength } = useQueueProcessor(projectId);

  useEffect(() => {
    const handleOnline = (): void => setIsOnline(true);
    const handleOffline = (): void => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const queueOperation = useCallback(<T extends OperationType>(
    operation: Omit<QueuedOperation<T>, 'id' | 'timestamp' | 'retryCount'>
  ): QueuedOperation<T> | undefined => {
    if (!operation.type || !operation.data) return;
    
    return {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0,
      priority: operation.priority || OperationPriority.MEDIUM
    } as QueuedOperation<T>;
  }, []);

  return {
    isOnline,
    queueOperation,
    hasQueuedOperations,
    hasPendingOperations,
    isProcessing,
    isSyncing,
    queueLength,
    pendingOperations,
    syncNow
  };
} 