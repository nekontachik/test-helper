import type { TestRun, User, TestCaseResult } from '@prisma/client';
import type { TestResultStatus } from '@/types/testRun';

/**
 * Type for a test run case with related data
 */
export type TestRunCase = {
  id: string;
  testRunId: string;
  testCaseId: string;
  status: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  testCase: {
    id: string;
    title: string;
    priority: string;
    status: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    description: string | null;
    steps: string;
    expectedResult: string;
    actualResult: string;
    projectId: string;
    currentVersion: number;
    deleted: boolean;
  };
  user: User;
};

/**
 * Type definition for a test run with test cases and results
 */
export type TestRunWithResults = TestRun & {
  testRunCases: TestRunCase[];
  testResults: TestCaseResult[];
};

/**
 * Interface for test duration metrics
 */
export interface TestDuration {
  testCaseId: string;
  duration: number;
}

/**
 * Type for test result summary with optional fields
 */
export interface TestResultSummaryWithOptionals {
  status: TestResultStatus;
  priority?: string;
  startTime?: Date | undefined;
  endTime?: Date | undefined | null;
} 