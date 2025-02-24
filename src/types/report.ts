export interface ReportMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  createdBy: string;
  format: 'PDF' | 'CSV' | 'JSON';
}

export interface TestRunReport {
  testRun: {
    id: string;
    name: string;
    startedAt: Date;
    completedAt?: Date;
    status: string;
  };
  statistics: {
    total: number;
    passed: number;
    failed: number;
    blocked: number;
    skipped: number;
    passRate: number;
    duration: number;
  };
  results: Array<{
    testCaseId: string;
    testCaseName: string;
    status: string;
    executedBy: string;
    executedAt: Date;
    notes?: string;
  }>;
} 