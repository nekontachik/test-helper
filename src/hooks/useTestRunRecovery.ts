import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { TestResult } from '@/types/testResults';

interface RecoveryState {
  result: TestResult;
  error: string;
  timestamp: number;
}

export function useTestRunRecovery(projectId: string, testRunId: string) {
  const storageKey = `testrun:${projectId}:${testRunId}:recovery`;
  const [savedState, setSavedState] = useLocalStorage<RecoveryState | null>(storageKey, null);
  const [isRecovering, setIsRecovering] = useState(false);

  const saveState = useCallback((state: Omit<RecoveryState, 'timestamp'>) => {
    setSavedState({
      ...state,
      timestamp: Date.now()
    });
  }, [setSavedState]);

  const clearRecovery = useCallback(() => {
    setSavedState(null);
  }, [setSavedState]);

  const attemptRecovery = useCallback(async () => {
    if (!savedState || isRecovering) return;
    
    try {
      setIsRecovering(true);
      // Recovery logic will be implemented in useTestRunManager
    } catch (error) {
      console.error('Recovery failed:', error);
    } finally {
      setIsRecovering(false);
    }
  }, [savedState, isRecovering]);

  // Attempt recovery when coming back online
  useEffect(() => {
    const handleOnline = () => {
      if (savedState) {
        attemptRecovery();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [savedState, attemptRecovery]);

  return {
    savedState,
    saveState,
    clearRecovery,
    isRecovering,
    attemptRecovery
  };
} 