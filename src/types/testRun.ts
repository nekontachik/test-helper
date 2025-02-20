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
} 