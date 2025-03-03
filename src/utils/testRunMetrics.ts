import { TestCaseResultStatus } from '@/types';

// Define the interfaces needed for this file
interface TestResult {
  status: TestCaseResultStatus;
  // Add other properties as needed
}

interface TestRun {
  results?: TestResult[];
  startTime?: string | Date;
  endTime?: string | Date;
  // Add other properties as needed
}

/**
 * Calculates the pass rate for a test run
 * @param results Array of test results
 * @returns Pass rate as a percentage (0-100)
 */
export function calculatePassRate(results?: TestResult[]): number {
  if (!results || results.length === 0) return 0;
  
  const passedCount = results.filter(
    result => result.status === TestCaseResultStatus.PASSED
  ).length;
  
  return Math.round((passedCount / results.length) * 100);
}

/**
 * Calculates various metrics for a test run
 * @param testRun The test run to calculate metrics for
 * @returns Object containing various test metrics
 */
export function calculateTestRunMetrics(testRun?: TestRun): {
  passRate: number;
  passedCount: number;
  failedCount: number;
  skippedCount: number;
  totalCount: number;
  duration: number;
} {
  if (!testRun?.results) {
    return {
      passRate: 0,
      passedCount: 0,
      failedCount: 0,
      skippedCount: 0,
      totalCount: 0,
      duration: 0,
    };
  }
  
  const passedCount = testRun.results.filter(
    (result: TestResult) => result.status === TestCaseResultStatus.PASSED
  ).length;
  
  const failedCount = testRun.results.filter(
    (result: TestResult) => result.status === TestCaseResultStatus.FAILED
  ).length;
  
  const skippedCount = testRun.results.filter(
    (result: TestResult) => result.status === TestCaseResultStatus.SKIPPED
  ).length;
  
  const totalCount = testRun.results.length;
  const passRate = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
  
  // Calculate duration if start and end times are available
  const duration = testRun.endTime && testRun.startTime 
    ? new Date(testRun.endTime).getTime() - new Date(testRun.startTime).getTime()
    : 0;
  
  return {
    passRate,
    passedCount,
    failedCount,
    skippedCount,
    totalCount,
    duration,
  };
} 