import { useState, useEffect } from 'react';
import { TestRunResult } from '@/types';

const STORAGE_KEY = 'testRunProgress';

interface TestRunProgress {
  projectId: string;
  testRunId: string;
  currentIndex: number;
  results: TestRunResult[];
}

export function useTestRunProgress(projectId: string, testRunId: string) {
  const storageKey = `${STORAGE_KEY}:${projectId}:${testRunId}`;

  const loadProgress = (): TestRunProgress | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return null;
      
      const progress = JSON.parse(saved);
      if (progress.projectId !== projectId || progress.testRunId !== testRunId) {
        return null;
      }
      
      return progress;
    } catch {
      return null;
    }
  };

  const [progress, setProgress] = useState<TestRunProgress>(() => {
    return loadProgress() || {
      projectId,
      testRunId,
      currentIndex: 0,
      results: [],
    };
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [progress, storageKey]);

  const updateProgress = (updates: Partial<TestRunProgress>) => {
    setProgress(prev => ({ ...prev, ...updates }));
  };

  const clearProgress = () => {
    localStorage.removeItem(storageKey);
    setProgress({
      projectId,
      testRunId,
      currentIndex: 0,
      results: [],
    });
  };

  return {
    progress: progress,
    updateProgress,
    clearProgress,
  };
} 