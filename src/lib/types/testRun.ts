import type { TestRun, TestCase, TestCaseResult } from '@prisma/client';

export type TestStatus = 'PASSED' | 'FAILED' | 'BLOCKED' | 'SKIPPED' | 'IN_PROGRESS';

export type TestRunStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';

export interface TestResult {
  id: string;
  testCaseId: string;
  status: TestStatus;
  executedBy: string;
  executedAt: Date;
  duration: number; // in milliseconds
  notes?: string;
  attachments?: string[]; // URLs to attached files
  errorDetails?: {
    message: string;
    stackTrace?: string;
    screenshot?: string;
  };
}

export interface TestRun {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: TestRunStatus;
  environment: string;
  browser?: string;
  platform?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  testResults: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  blockedTests: number;
  skippedTests: number;
}

export interface CreateTestRunInput {
  projectId: string;
  name: string;
  description?: string;
  environment: string;
  browser?: string;
  platform?: string;
  testCaseIds: string[];
}

export interface UpdateTestResultInput {
  status: TestStatus;
  notes?: string;
  attachments?: string[];
  errorDetails?: {
    message: string;
    stackTrace?: string;
    screenshot?: string;
  };
}

export type TestResultStatus = 'PASSED' | 'FAILED' | 'PENDING' | 'SKIPPED';

export interface TestRunWithCases extends TestRun {
  testRunCases: Array<{
    id: string;
    testRunId: string;
    testCaseId: string;
    status: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    testCase: TestCase;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
    testCaseResults: TestCaseResult[];
  }>;
}

export interface TestRunInput {
  title: string;
  description?: string | null;
  projectId: string;
  testCaseIds: string[];
  environment: string;
}

export interface TestResultSummary {
  status: TestResultStatus;
  priority?: string;
  startTime?: Date;
  endTime?: Date | null;
} 