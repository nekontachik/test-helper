import { useState, useCallback } from 'react';
import type { TestRun } from '@/types/testRuns';
import { fetchTestRuns, fetchTestRun, fetchProjectTestRuns, createTestRun } from '@/utils/mockApi';
import { logger } from '@/lib/logger';

interface UseTestRunsDataReturn {
  testRuns: TestRun[] | null;
  testRun: TestRun | null;
  isLoading: boolean;
  error: string | null;
  fetchAllTestRuns: () => Promise<void>;
  fetchTestRunById: (id: string) => Promise<void>;
  fetchTestRunsByProject: (projectId: string) => Promise<void>;
  createNewTestRun: (testRunData: Partial<TestRun>) => Promise<TestRun | null>;
}

export function useTestRunsData(): UseTestRunsDataReturn {
  const [testRuns, setTestRuns] = useState<TestRun[] | null>(null);
  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all test runs
  const fetchAllTestRuns = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      logger.debug('Fetching all test runs');
      const response = await fetchTestRuns();
      
      if (response.success && response.data) {
        setTestRuns(response.data);
      } else {
        setError(response.error || 'Failed to fetch test runs');
      }
    } catch (err) {
      logger.error('Error fetching test runs:', err);
      setError('An unexpected error occurred while fetching test runs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch a single test run by ID
  const fetchTestRunById = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      logger.debug(`Fetching test run with ID: ${id}`);
      const response = await fetchTestRun(id);
      
      if (response.success && response.data) {
        setTestRun(response.data);
      } else {
        setError(response.error || 'Failed to fetch test run');
      }
    } catch (err) {
      logger.error('Error fetching test run:', err);
      setError('An unexpected error occurred while fetching the test run');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch test runs for a specific project
  const fetchTestRunsByProject = useCallback(async (projectId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      logger.debug(`Fetching test runs for project: ${projectId}`);
      const response = await fetchProjectTestRuns(projectId);
      
      if (response.success && response.data) {
        setTestRuns(response.data);
      } else {
        setError(response.error || 'Failed to fetch project test runs');
      }
    } catch (err) {
      logger.error('Error fetching project test runs:', err);
      setError('An unexpected error occurred while fetching test runs for this project');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new test run
  const createNewTestRun = useCallback(async (testRunData: Partial<TestRun>): Promise<TestRun | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      logger.debug('Creating new test run', testRunData);
      const response = await createTestRun(testRunData);
      
      if (response.success && response.data) {
        const newTestRun = response.data as TestRun;
        // If we already have test runs, add the new one to the list
        if (testRuns) {
          setTestRuns(prevRuns => prevRuns ? [...prevRuns, newTestRun] : [newTestRun]);
        }
        return newTestRun;
      } else {
        setError(response.error || 'Failed to create test run');
        return null;
      }
    } catch (err) {
      logger.error('Error creating test run:', err);
      setError('An unexpected error occurred while creating the test run');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [testRuns]);

  return {
    testRuns,
    testRun,
    isLoading,
    error,
    fetchAllTestRuns,
    fetchTestRunById,
    fetchTestRunsByProject,
    createNewTestRun,
  };
} 