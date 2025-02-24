import type { TestCase, TestCaseResult } from '@prisma/client';
import type { ReportMetrics } from '../services/types';

export function calculateMetrics(results: Array<TestCaseResult & { testCase: TestCase }>): ReportMetrics {
  const counts = results.reduce((acc, r) => ({
    PASSED: acc.PASSED + (r.status === 'PASSED' ? 1 : 0),
    FAILED: acc.FAILED + (r.status === 'FAILED' ? 1 : 0),
    SKIPPED: acc.SKIPPED + (r.status === 'SKIPPED' ? 1 : 0),
    blockers: acc.blockers + (r.status === 'FAILED' && r.testCase.priority === 'HIGH' ? 1 : 0),
    executionTime: acc.executionTime + calculateDuration(r.completedAt, r.createdAt)
  }), { 
    PASSED: 0, 
    FAILED: 0, 
    SKIPPED: 0, 
    blockers: 0, 
    executionTime: 0 
  });

  return {
    totalTests: results.length,
    passed: counts.PASSED,
    failed: counts.FAILED,
    skipped: counts.SKIPPED,
    blockers: counts.blockers,
    executionTime: counts.executionTime,
    passRate: results.length > 0 ? (counts.PASSED / results.length) * 100 : 0
  };
}

function calculateDuration(end?: Date | null, start?: Date | null): number {
  return (end && start) ? end.getTime() - start.getTime() : 0;
} 