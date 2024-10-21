import { useState, useEffect } from 'react';
import { TestRun } from '@/models/testRun';
import { getTestRun } from '@/lib/api/testRuns';

export function useTestRun(projectId: string, testRunId: string) {
  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTestRun() {
      try {
        const fetchedTestRun = await getTestRun(projectId, testRunId);
        setTestRun(fetchedTestRun);
      } catch (error) {
        console.error('Failed to fetch test run:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (projectId && testRunId) {
      fetchTestRun();
    }
  }, [projectId, testRunId]);

  return { testRun, isLoading };
}
