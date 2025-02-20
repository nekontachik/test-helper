import { useState, useCallback } from 'react';

type OperationType = 'upload' | 'testResult';
type OperationPriority = 'high' | 'medium' | 'low';

interface QueuedOperation {
  id: string;
  type: OperationType;
  data: any;
  priority: OperationPriority;
  timestamp: number;
  retryCount: number;
}

const QUEUE_KEY = 'operationQueue';

export function useOperationQueue(projectId: string) {
  const [queue, setQueue] = useState<QueuedOperation[]>(() => {
    try {
      const saved = localStorage.getItem(`${QUEUE_KEY}:${projectId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addToQueue = useCallback((
    type: OperationType,
    data: any,
    priority: OperationPriority = 'medium'
  ) => {
    const operation: QueuedOperation = {
      id: `${type}_${Date.now()}`,
      type,
      data,
      priority,
      timestamp: Date.now(),
      retryCount: 0,
    };

    setQueue(prev => {
      const newQueue = [...prev, operation].sort((a, b) => {
        // Sort by priority first
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        // Then by timestamp
        return a.timestamp - b.timestamp;
      });
      localStorage.setItem(`${QUEUE_KEY}:${projectId}`, JSON.stringify(newQueue));
      return newQueue;
    });
  }, [projectId]);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => {
      const newQueue = prev.filter(op => op.id !== id);
      localStorage.setItem(`${QUEUE_KEY}:${projectId}`, JSON.stringify(newQueue));
      return newQueue;
    });
  }, [projectId]);

  const updateOperation = useCallback((id: string, updates: Partial<QueuedOperation>) => {
    setQueue(prev => {
      const newQueue = prev.map(op => 
        op.id === id ? { ...op, ...updates } : op
      );
      localStorage.setItem(`${QUEUE_KEY}:${projectId}`, JSON.stringify(newQueue));
      return newQueue;
    });
  }, [projectId]);

  const getNextOperation = useCallback(() => {
    return queue[0];
  }, [queue]);

  return {
    queue,
    addToQueue,
    removeFromQueue,
    updateOperation,
    getNextOperation,
    hasOperations: queue.length > 0,
  };
} 