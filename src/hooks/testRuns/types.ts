import type { TestRun, TestRunFormData, TestRunStatus, TestCaseResultStatus } from '../../types';

/**
 * Result structure for test run queries
 */
export interface TestRunQueryResult {
  items: TestRun[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Variables for creating a test run
 */
export interface CreateTestRunVariables {
  projectId: string;
  testRun: TestRunFormData;
}

/**
 * Variables for updating a test run
 */
export interface UpdateTestRunVariables {
  runId: string;
  status: TestRunStatus;
  testCaseResults: {
    id: string;
    status: TestCaseResultStatus;
    testCaseId: string;
    notes?: string;
  }[];
}

/**
 * Variables for bulk deleting test runs
 */
export interface BulkDeleteTestRunsVariables {
  projectId: string;
  runIds: string[];
}

/**
 * Options for test run queries
 */
export interface TestRunsOptions {
  enabled?: boolean;
  staleTime?: number;
  retry?: boolean | number;
  retryDelay?: number;
  showToasts?: boolean;
  filters?: {
    status?: TestRunStatus;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    userId?: string;
  };
}

/**
 * Options for single test run query
 */
export interface TestRunOptions {
  enabled?: boolean;
  retry?: boolean | number;
  staleTime?: number;
  showToasts?: boolean;
}

/**
 * Custom error class with error code support
 */
export class TestRunError extends Error {
  code: string;
  
  constructor(message: string, code = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'TestRunError';
    this.code = code;
  }
} 