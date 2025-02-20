export enum TestRunStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  BLOCKED = 'blocked',
  SKIPPED = 'skipped'
}

export enum OperationType {
  UPLOAD = 'upload',
  TEST_RESULT = 'testResult'
}

export enum OperationPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export interface QueueData {
  testResult: {
    testRunId: string;
    testCaseId: string;
    status: TestRunStatus;
    notes?: string;
    evidenceUrls?: string[];
  };
  upload: {
    file: File;
    testRunId: string;
  };
}

export interface QueuedOperation<T extends OperationType = OperationType> {
  id: string;
  type: T;
  data: QueueData[T];
  priority: OperationPriority;
  timestamp: number;
  retryCount: number;
} 