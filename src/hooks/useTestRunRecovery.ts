import { useState, useCallback } from 'react';
import { TestRunResult } from '@/types';

interface RecoveryState {
  lastAttemptedIndex: number;
  failedResults: TestRunResult[];
  retryCount: number;
}

const STORAGE_KEY = 'testRunRecovery';

export function useTestRunRecovery(projectId: string, testRunId: string) {
  const storageKey = `${STORAGE_KEY}:${projectId}:${testRunId}`;
  
  const [recoveryState, setRecoveryState] = useState<RecoveryState>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {
        lastAttemptedIndex: -1,
        failedResults: [],
        retryCount: 0,
      };
    } catch {
      return {
        lastAttemptedIndex: -1,
        failedResults: [],
        retryCount: 0,
      };
    }
  });

  const saveRecoveryState = useCallback((state: RecoveryState) => {
    localStorage.setItem(storageKey, JSON.stringify(state));
    setRecoveryState(state);
  }, [storageKey]);

  const markFailedAttempt = useCallback((index: number, result: TestRunResult) => {
    const newState = {
      lastAttemptedIndex: index,
      failedResults: [...recoveryState.failedResults, result],
      retryCount: recoveryState.retryCount + 1,
    };
    saveRecoveryState(newState);
  }, [recoveryState, saveRecoveryState]);

  const clearRecovery = useCallback(() => {
    localStorage.removeItem(storageKey);
    setRecoveryState({
      lastAttemptedIndex: -1,
      failedResults: [],
      retryCount: 0,
    });
  }, [storageKey]);

  const canRetry = recoveryState.retryCount < 3 && recoveryState.failedResults.length > 0;

  return {
    recoveryState,
    markFailedAttempt,
    clearRecovery,
    canRetry,
  };
} 