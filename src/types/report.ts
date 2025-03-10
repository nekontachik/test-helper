/**
 * Test result status
 */
export type TestResultStatus = 'PASSED' | 'FAILED' | 'BLOCKED' | 'SKIPPED';

/**
 * Test run status
 */
export type TestRunStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

/**
 * Test result information
 */
export interface TestResult {
  testCaseId: string;
  testCaseName: string;
  status: TestResultStatus;
  executedBy: string;
  executedAt: Date;
  notes?: string;
}

/**
 * Test run statistics
 */
export interface TestRunStatistics {
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
  passRate: number;
  duration: number;
}

/**
 * Test run information
 */
export interface TestRunInfo {
  id: string;
  name: string;
  startedAt: Date;
  completedAt?: Date;
  status: TestRunStatus;
}

/**
 * Complete test run report
 */
export interface TestRunReport {
  testRun: TestRunInfo;
  statistics: TestRunStatistics;
  results: TestResult[];
}

export interface ReportMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  createdBy: string;
  format: 'PDF' | 'CSV' | 'JSON';
} 