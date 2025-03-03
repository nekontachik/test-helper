import type { TestResultStatus } from '@/types/testRun';
import type { TestRunWithResults, TestResultSummaryWithOptionals } from './types';

/**
 * Calculate test run duration in milliseconds
 */
export function calculateTestRunDuration(
  startTime?: Date | null, 
  endTime?: Date | null
): number {
  if (!startTime || !endTime) return 0;
  return endTime.getTime() - startTime.getTime();
}

/**
 * Map test run cases to result summaries
 */
export function mapTestCasesToResultSummaries(
  testRun: TestRunWithResults
): TestResultSummaryWithOptionals[] {
  return testRun.testRunCases.map((trc) => {
    const result = testRun.testResults.find(r => r.testCaseId === trc.testCase.id);
    return {
      status: (result?.status || 'PENDING') as TestResultStatus,
      priority: trc.testCase.priority,
      startTime: result?.createdAt,
      endTime: result?.executedAt
    };
  });
}

/**
 * Count test results by status
 */
export function countResultsByStatus(
  results: Array<{ status: string }>
): Record<string, number> {
  return results.reduce((acc, result) => {
    acc[result.status] = (acc[result.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Calculate test durations from test results
 */
export function calculateTestDurations(
  testRun: TestRunWithResults
): Array<{ testCaseId: string; duration: number }> {
  return testRun.testRunCases
    .map((trc) => {
      const result = testRun.testResults.find(r => r.testCaseId === trc.testCase.id);
      if (!result?.executedAt || !result.createdAt) return null;
      return {
        testCaseId: trc.testCase.id,
        duration: result.executedAt.getTime() - result.createdAt.getTime()
      };
    })
    .filter((d): d is { testCaseId: string; duration: number } => d !== null)
    .sort((a, b) => b.duration - a.duration);
} 