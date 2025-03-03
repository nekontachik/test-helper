/**
 * Represents the status of a test run
 */
export enum TestRunStatus {
  PENDING = 'PENDING',       // Test run created but not started
  IN_PROGRESS = 'IN_PROGRESS', // Test run is currently being executed
  COMPLETED = 'COMPLETED',    // All test cases have been executed
  CANCELLED = 'CANCELLED',    // Test run was cancelled before completion
  FAILED = 'FAILED'          // Test run encountered an error during execution
}

/**
 * Represents the status of a test case result
 */
export enum TestResultStatus {
  PASSED = 'PASSED',         // Test case passed all criteria
  FAILED = 'FAILED',         // Test case failed one or more criteria
  SKIPPED = 'SKIPPED',       // Test case was intentionally skipped
  BLOCKED = 'BLOCKED',       // Test case could not be executed due to dependencies
  NOT_EXECUTED = 'NOT_EXECUTED' // Test case has not been executed yet
}

/**
 * Evidence for test results during form submission
 */
export interface TestResultEvidence {
  file?: File;
  url?: string;
  description?: string;
}

/**
 * Base interface for test run data
 */
export interface TestRunBase {
  name: string;
  description?: string;
  projectId: string;
}

/**
 * Represents a test result
 */
export interface TestResult {
  readonly id: string;
  readonly testCaseId: string;
  readonly testRunId: string;
  status: TestResultStatus;
  notes?: string;
  readonly executedById?: string;
  readonly executedAt?: Date;
  duration?: number;
  evidence?: string[]; // URLs to uploaded files
}

/**
 * Represents a complete test run
 */
export interface TestRun extends TestRunBase {
  readonly id: string;
  status: TestRunStatus;
  readonly createdById: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  testCaseIds: string[];
  results?: TestResult[];
}

/**
 * Input for creating a new test run
 */
export interface TestRunInput extends TestRunBase {
  testCaseIds: string[];
}

/**
 * Form data for submitting a test result
 */
export interface TestResultFormData {
  status: TestResultStatus;
  notes?: string;
  evidence?: TestResultEvidence[];
}

/**
 * Summary statistics for a test run
 */
export interface TestRunSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  blocked: number;
  notExecuted: number;
  passRate: number; // Percentage from 0-100
  completionRate: number; // Percentage from 0-100
}

/**
 * Detailed test case result for display
 */
export interface TestCaseResult {
  id: string;
  title: string;
  priority: string;
  status: TestResultStatus;
  executedAt?: string;
  executedBy?: string;
  notes?: string;
  duration?: number;
}

/**
 * Test run with detailed test case information
 */
export interface TestRunWithCases extends TestRun {
  testCases: TestCaseResult[];
}

/**
 * Summary of test results by status
 */
export interface TestResultSummary {
  status: TestResultStatus;
  count: number;
  percentage: number;
}

/**
 * Type guard to check if a test run is completed
 */
export function isCompletedTestRun(testRun: TestRun): boolean {
  return testRun.status === TestRunStatus.COMPLETED;
}

/**
 * Type guard to check if a test result is passing
 */
export function isPassingResult(result: TestResult): boolean {
  return result.status === TestResultStatus.PASSED;
} 