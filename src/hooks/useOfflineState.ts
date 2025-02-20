import { useState, useEffect, useCallback } from 'react';
import { TestCaseResultStatus } from '@/types';

// Use a more specific type for operation data
interface TestResultData {
  testRunId?: string;
  testCaseId?: string;
  status?: TestCaseResultStatus;
  notes?: string;
  evidenceUrls?: string[];
  timestamp?: number;
}

interface UploadData {
  file: File;
  testCaseId: string;
  testRunId: string;
  index: number;
}

interface QueuedOperation {
  id: string;
  type: 'upload' | 'testResult';
  data: UploadData | TestResultData;
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
  retryCount: number;
}

// Update the addPendingOperation type signature
type OperationData = UploadData | TestResultData;

const OFFLINE_STORAGE_KEY = 'offlineOperations';
const MAX_RETRIES = 3;

export function useOfflineState(projectId: string, testRunId: string) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingOperations, setPendingOperations] = useState<QueuedOperation[]>(() => {
    try {
      const saved = localStorage.getItem(`${OFFLINE_STORAGE_KEY}:${projectId}:${testRunId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(
      `${OFFLINE_STORAGE_KEY}:${projectId}:${testRunId}`, 
      JSON.stringify(pendingOperations)
    );
  }, [pendingOperations, projectId, testRunId]);

  const addPendingOperation = useCallback((
    type: 'upload' | 'testResult',
    data: OperationData,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    const operation: QueuedOperation = {
      id: `${type}_${Date.now()}`,
      type,
      data,
      priority,
      timestamp: Date.now(),
      retryCount: 0
    };

    setPendingOperations(prev => [...prev, operation]);
  }, []);

  const removePendingOperation = useCallback((id: string) => {
    setPendingOperations(prev => prev.filter(op => op.id !== id));
  }, []);

  const updatePendingOperation = useCallback((id: string, updates: Partial<QueuedOperation>) => {
    setPendingOperations(prev => 
      prev.map(op => op.id === id ? { ...op, ...updates } : op)
    );
  }, []);

  const clearPendingOperations = useCallback(() => {
    setPendingOperations([]);
    localStorage.removeItem(`${OFFLINE_STORAGE_KEY}:${projectId}:${testRunId}`);
  }, [projectId, testRunId]);

  const processOperation = useCallback(async (operation: QueuedOperation) => {
    if (operation.retryCount >= MAX_RETRIES) {
      removePendingOperation(operation.id);
      return;
    }

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
        const resultData = operation.data as TestResultData;
        const response = await fetch(
          `/api/projects/${projectId}/test-runs/${testRunId}/results`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resultData),
          }
        );
        if (!response.ok) throw new Error('Result sync failed');
      }
      removePendingOperation(operation.id);
    } catch (error) {
      updatePendingOperation(operation.id, {
        retryCount: operation.retryCount + 1,
        timestamp: Date.now() + (operation.retryCount + 1) * 5000,
      });
      console.error('Failed to process operation:', error);
    }
  }, [projectId, testRunId, removePendingOperation, updatePendingOperation]);

  const processPendingOperations = useCallback(async (batchSize = 3) => {
    if (!isOnline || isProcessing) return;
    
    setIsProcessing(true);
    const batch = pendingOperations.slice(0, batchSize);
    
    try {
      await Promise.all(batch.map(processOperation));
    } finally {
      setIsProcessing(false);
    }
  }, [isOnline, isProcessing, pendingOperations, processOperation]);

  useEffect(() => {
    if (isOnline) {
      processPendingOperations();
    }
  }, [isOnline, processPendingOperations]);

  return {
    isOnline,
    hasPendingOperations: pendingOperations.length > 0,
    pendingOperations,
    addPendingOperation,
    removePendingOperation,
    updatePendingOperation,
    clearPendingOperations,
  };
} 