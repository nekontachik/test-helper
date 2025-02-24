import type { TestReport, TestRun, TestCase, TestCaseResult } from '@prisma/client';

export interface ReportInput {
  title: string;
  projectId: string;
  testRunId?: string;
  filters?: {
    status?: string[];
    priority?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
}

export interface ReportMetrics {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  blockers: number;
  executionTime: number;
  passRate: number;
}

export interface TestRunData {
  testRun: {
    testRun: TestRun;
    testRunCases: Array<{
      testCase: TestCase;
      results: TestCaseResult[];
    }>;
  };
  results: Array<{
    testCase: TestCase;
    result: TestCaseResult;
  }>;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
}

export interface DetailedReport extends TestReport {
  metrics: ReportMetrics;
  testRunSummary?: TestRunData;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
} 