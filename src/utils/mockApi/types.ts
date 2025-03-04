import type { Project, TestRun, TestCase } from '@/types/testRuns';

/**
 * Standard API response format
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Re-export types from testRuns for convenience
 */
export type { Project, TestRun, TestCase }; 