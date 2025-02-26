import { useState } from 'react';
import type { TestResult } from '@/types/testResults';

interface TestRunProgress {
  currentIndex: number;
  results: TestResult[];
}

export function useTestRunProgress(projectId: string, testRunId: string): {
  progress: TestRunProgress;
  updateProgress: (updates: Partial<TestRunProgress>) => void;
  clearProgress: () => void;
} {
  const storageKey = `testrun:${projectId}:${testRunId}`;
  
  const [progress, setProgress] = useState<TestRunProgress>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : { currentIndex: 0, results: [] };
    } catch {
      return { currentIndex: 0, results: [] };
    }
  });

  const updateProgress = (updates: Partial<TestRunProgress>): void => {
    setProgress(prev => {
      const newProgress = { ...prev, ...updates };
      localStorage.setItem(storageKey, JSON.stringify(newProgress));
      return newProgress;
    });
  };

  const clearProgress = (): void => {
    localStorage.removeItem(storageKey);
    setProgress({ currentIndex: 0, results: [] });
  };

  return { progress, updateProgress, clearProgress };
} 