import type { TestReport, TestRun, TestCase } from '@prisma/client';
import type { TestResultStatus } from './constants';

export interface TestRunCase {
  id: string;
  testCase: TestCase;
  status: TestResultStatus;
  notes?: string | null;
  updatedAt: Date;
}

export interface TestRunWithRelations extends TestRun {
  testRunCases: Array<{
    testCase: TestCase;
    id: string;
    testRunId: string;
    testCaseId: string;
    status: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  testResults: Array<{
    id: string;
    testRunId: string;
    testCaseId: string;
    status: string;
    notes: string | null;
    userId: string;
    startedAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export type ReportWithUser = TestReport & {
  user: { id: string; email: string };
};

export interface DetailedReport extends TestReport {
  metrics: ReportMetrics;
  testRunSummary?: TestRunData;
}

export interface TestRunData {
  testRun: {
    testRun: TestRunWithRelations;
    testRunCases: Array<{
      testCase: TestCase;
      result: null;
      status: string;
    }>;
  };
  results: Array<{
    testCase: TestCase;
    result: null;
    status: string;
  }>;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export type TestCasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ReportInput {
  title: string;
  projectId: string;
  testRunId?: string;
  filters?: {
    status?: TestResultStatus[];
    dateRange?: {
      start: Date;
      end: Date;
    };
    priority?: TestCasePriority[];
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

export type ErrorCode = 
  | 'NO_RESULTS'
  | 'INVALID_RESULTS'
  | 'CALCULATION_ERROR'
  | 'UNKNOWN_ERROR'
  | 'VALIDATION_ERROR';

export interface MetricsError {
  code: ErrorCode;
  message: string;
  details?: unknown;
}

export interface MetricsResult {
  success: boolean;
  data?: ReportMetrics;
  error?: MetricsError;
} 