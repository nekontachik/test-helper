export enum TestRunStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum TestResultStatus {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
  BLOCKED = 'BLOCKED'
}

export interface TestRun {
  id: string;
  name: string;
  description?: string;
  status: TestRunStatus;
  projectId: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  results: TestResult[];
}

export interface TestResult {
  id: string;
  testCaseId: string;
  runId: string;
  status: TestResultStatus;
  notes?: string;
  startedAt: Date;
  completedAt?: Date;
  executedById?: string;
  name: string;
  duration: number;
  errorMessage?: string;
  stackTrace?: string;
  testRunId: string;
}

export type TestRunStatus = 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'CANCELLED' | 'ERROR';
export type TestResultStatus = 'PASSED' | 'FAILED' | 'SKIPPED' | 'ERROR'; 