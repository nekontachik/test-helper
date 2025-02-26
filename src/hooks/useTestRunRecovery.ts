import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { TestResult } from '@/types/testResults';

interface RecoveryState {
  result: TestResult;
  error: string;
  timestamp: number;
}

export function useTestRunRecovery(projectId: string, testRunId: string): {
  savedState: RecoveryState | null;
  saveState: (state: Omit<RecoveryState, 'timestamp'>) => void;
  clearRecovery: () => void;
  isRecovering: boolean;
  attemptRecovery: () => Promise<void>;
} {
  const storageKey = `testrun:${projectId}:${testRunId}:recovery`;
  const [savedState, setSavedState] = useLocalStorage<RecoveryState | null>(storageKey, null);
  const [isRecovering, setIsRecovering] = useState(false);

  const saveState = useCallback((state: Omit<RecoveryState, 'timestamp'>): void => {
    setSavedState({
      ...state,
      timestamp: Date.now()
    });
  }, [setSavedState]);

  const clearRecovery = useCallback((): void => {
    setSavedState(null);
  }, [setSavedState]);

  const attemptRecovery = useCallback(async (): Promise<void> => {
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
    const handleOnline = (): void => {
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