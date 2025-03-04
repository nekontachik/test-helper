import type { TestRunWithResults } from './types';
import type { TestRunWithCases } from '@/lib/types/testRun';

/**
 * Maps a TestRunWithResults to a TestRunWithCases
 */
export function mapToTestRunWithCases(testRun: TestRunWithResults): TestRunWithCases {
  return {
    ...testRun,
    testRunCases: testRun.testRunCases.map((trc) => ({
      id: trc.id,
      testRunId: trc.testRunId,
      testCaseId: trc.testCaseId,
      status: trc.status,
      userId: trc.userId,
      createdAt: trc.createdAt,
      updatedAt: trc.updatedAt,
      testCase: trc.testCase,
      user: {
        id: trc.user.id,
        name: trc.user.name,
        email: trc.user.email
      },
      testCaseResults: testRun.testResults.filter((r) => r.testCaseId === trc.testCaseId)
    }))
  };
}

/**
 * Calculates test run summary statistics
 */
export function calculateTestRunSummary(testRun: TestRunWithResults): {
  status: string;
  total: number;
  passed: number;
  failed: number;
  pending: number;
  skipped: number;
} {
  const total = testRun.testRunCases.length;
  const passed = testRun.testResults.filter(r => r.status === 'PASSED').length;
  const failed = testRun.testResults.filter(r => r.status === 'FAILED').length;
  const skipped = testRun.testResults.filter(r => r.status === 'SKIPPED').length;
  const pending = total - (passed + failed + skipped);
  
  return {
    status: testRun.status,
    total,
    passed,
    failed,
    pending,
    skipped
  };
} 