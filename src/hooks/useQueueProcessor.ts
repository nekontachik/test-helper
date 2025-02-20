import { useState, useEffect, useCallback } from 'react';
import { useOperationQueue } from './useOperationQueue';
import { useToast } from './useToast';
import type { QueuedOperation, ApiErrorResponse } from '../types/index';

const BATCH_SIZE = 3;
const PROCESSING_INTERVAL = 5000; // 5 seconds
const MAX_RETRIES = 3;

interface ProcessError extends Error {
  response?: ApiErrorResponse;
}

export function useQueueProcessor(projectId: string) {
  const { 
    queue, 
    removeFromQueue, 
    updateOperation 
  } = useOperationQueue(projectId);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showErrorToast } = useToast();

  const handleOperationError = useCallback((
    operation: { id: string; retryCount: number },
    error: unknown
  ) => {
    const processError = error as ProcessError;
    if (operation.retryCount < MAX_RETRIES) {
      updateOperation(operation.id, {
        retryCount: operation.retryCount + 1,
        timestamp: Date.now() + (operation.retryCount + 1) * 5000, // Exponential backoff
      });
    } else {
      showErrorToast(
        `Failed to process operation: ${processError.message || 'Unknown error'}`
      );
      removeFromQueue(operation.id);
    }
  }, [updateOperation, removeFromQueue, showErrorToast]);

  const processOperation = useCallback(async (operation: QueuedOperation) => {
    try {
      if (operation.type === 'upload' && operation.data.file) {
        const formData = new FormData();
        formData.append('file', operation.data.file);
        
        const response = await fetch(`/api/projects/${projectId}/uploads`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          const errorData = await response.json() as ApiErrorResponse;
          throw new Error(errorData.message || `Operation failed: ${response.statusText}`);
        }
      } else if (operation.type === 'testResult') {
        const response = await fetch(
          `/api/projects/${projectId}/test-runs/${operation.data.testRunId}/results`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(operation.data),
          }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Result sync failed: ${response.statusText}`);
        }
      }
      removeFromQueue(operation.id);
      return true;
    } catch (error) {
      handleOperationError(operation, error);
      return false;
    }
  }, [projectId, removeFromQueue, handleOperationError]);

  const processBatch = useCallback(async () => {
    if (isProcessing || queue.length === 0) return;

    setIsProcessing(true);
    const batch = queue.slice(0, BATCH_SIZE);

    try {
      const results = await Promise.allSettled(
        batch.map(operation => processOperation(operation))
      );

      // Log batch processing results
      const succeeded = results.filter(r => r.status === 'fulfilled' && r.value).length;
      const failed = batch.length - succeeded;

      if (failed > 0) {
        console.warn(`Batch processing: ${succeeded} succeeded, ${failed} failed`);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [queue, isProcessing, processOperation]);

  useEffect(() => {
    const interval = setInterval(processBatch, PROCESSING_INTERVAL);
    return () => clearInterval(interval);
  }, [processBatch]);

  return {
    isProcessing,
    queueLength: queue.length,
    processBatch, // Expose for manual processing if needed
  };
} 