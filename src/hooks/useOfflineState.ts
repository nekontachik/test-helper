import { useState, useEffect, useCallback } from 'react';
import { requestQueue, type QueuedRequest } from '@/lib/queue/requestQueue';

interface UseOfflineStateReturn {
  isOnline: boolean;
  pendingOperations: QueuedRequest[];
  addPendingOperation: (operation: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount'>) => void;
  removePendingOperation: (id: string) => void;
  retrySync: () => Promise<void>;
}

export function useOfflineState(): UseOfflineStateReturn {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingOperations, setPendingOperations] = useState<QueuedRequest[]>(requestQueue.getQueue());

  useEffect(() => {
    const handleOnline = (): void => setIsOnline(true);
    const handleOffline = (): void => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update pending operations when queue changes
    const interval = setInterval(() => {
      setPendingOperations(requestQueue.getQueue());
    }, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const addPendingOperation = useCallback((operation: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount'>) => {
    requestQueue.enqueue(operation);
    setPendingOperations(requestQueue.getQueue());
  }, []);

  const removePendingOperation = useCallback((id: string) => {
    const newQueue = pendingOperations.filter(op => op.id !== id);
    requestQueue.clearQueue();
    newQueue.forEach(op => requestQueue.enqueue(op));
    setPendingOperations(newQueue);
  }, [pendingOperations]);

  const retrySync = useCallback(async () => {
    if (isOnline) {
      await requestQueue.processQueue();
      setPendingOperations(requestQueue.getQueue());
    }
  }, [isOnline]);

  return {
    isOnline,
    pendingOperations,
    addPendingOperation,
    removePendingOperation,
    retrySync
  };
} 