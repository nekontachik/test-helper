import { prisma } from '@/lib/prisma';
import type { TestRun, TestCase, TestRunCase, TestCaseResult } from '@prisma/client';
import { serviceResponse, type ServiceResponse } from '@/lib/utils/serviceResponse';
import { authUtils } from '@/lib/utils/authUtils';
import { ErrorFactory } from '@/lib/errors/BaseError';

// Add result status type
type TestResultStatus = 'PASSED' | 'FAILED' | 'PENDING' | 'SKIPPED';

interface TestRunInput {
  title: string;
  description?: string | null;
  projectId: string;
  testCaseIds: string[];
  environment: string;
}

interface TestRunDetails extends TestRun {
  testRunCases: (TestRunCase & {
    testCase: TestCase;
    result: TestCaseResult | null;
  })[];
}

interface TestRunWithResults extends TestRun {
  testRunCases: (TestRunCase & {
    testCase: TestCase;
    result: TestCaseResult | null;
  })[];
}

interface TestResultSummary {
  status: TestResultStatus;
  priority?: string;
  startTime?: Date;
  endTime?: Date | null;
}

// Update interfaces to match Prisma schema
interface TestRunWithCases extends TestRun {
  testRunCases: Array<TestRunCase & {
    testCase: TestCase;
    testCaseResults: TestCaseResult[];
  }>;
}

interface TestDuration {
  testCaseId: string;
  duration: number;
}

/**
 * Create a new test run
 */
export async function createTestRun(data: TestRunInput): Promise<ServiceResponse<TestRun>> {
  try {
    const session = await authUtils.requireAuth();
    
    const testRun = await prisma.$transaction(async (tx) => {
      // Verify all test cases exist and belong to the project
      const testCases = await tx.testCase.findMany({
        where: {
          id: { in: data.testCaseIds },
          projectId: data.projectId
        }
      });

      if (testCases.length !== data.testCaseIds.length) {
        throw ErrorFactory.create('VALIDATION_ERROR', 'Invalid test case IDs provided');
      }

      const createData = {
        name: data.title,
        project: { connect: { id: data.projectId } },
        status: 'PENDING',
        user: { connect: { id: session.user.id } },
        testRunCases: {
          create: data.testCaseIds.map(testCaseId => ({
            testCase: { connect: { id: testCaseId } }
          }))
        }
      };

      // Handle optional description separately
      const finalData = data.description !== undefined 
        ? { ...createData, description: data.description }
        : createData;

      return tx.testRun.create({
        data: finalData,
        include: {
          testRunCases: true
        }
      });
    });

    return serviceResponse.success(testRun);
  } catch (error) {
    return serviceResponse.error(error instanceof Error ? error : new Error('Unknown error'));
  }
}

/**
 * Execute test run in parallel
 */
export async function executeTestRun(
  runId: string
): Promise<ServiceResponse<TestRun>> {
  try {
    const session = await authUtils.requireAuth();

    const testRun = await prisma.$transaction(async (tx) => {
      const run = await tx.testRun.findUnique({
        where: { id: runId },
        include: { testRunCases: true }
      });

      if (!run) {
        throw ErrorFactory.create('NOT_FOUND', 'Test run not found');
      }

      if (run.status !== 'PENDING') {
        throw ErrorFactory.create('VALIDATION_ERROR', 'Test run is not in PENDING state');
      }

      const updateData = {
        status: 'IN_PROGRESS',
        startTime: new Date()
      } as const;

      const updated = await tx.testRun.update({
        where: { id: runId },
        data: updateData
      });

      // Initialize test case results
      await tx.testCaseResult.createMany({
        data: run.testRunCases.map(testCase => ({
          testRunId: runId,
          testCaseId: testCase.testCaseId,
          status: 'PENDING',
          userId: session.user.id
        }))
      });

      return updated;
    });

    return serviceResponse.success(testRun);
  } catch (error) {
    return serviceResponse.error(error instanceof Error ? error : new Error('Unknown error'));
  }
}

/**
 * Get test run details with test cases and results
 */
export async function getTestRunDetails(
  runId: string
): Promise<ServiceResponse<TestRunDetails>> {
  try {
    await authUtils.requireAuth();

    const testRun = await prisma.testRun.findUnique({
      where: { id: runId },
      include: {
        testRunCases: {
          include: {
            testCase: true,
            testCaseResults: {
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    });

    if (!testRun) {
      throw ErrorFactory.create('NOT_FOUND', 'Test run not found');
    }

    return serviceResponse.success(testRun as TestRunDetails);
  } catch (error) {
    return serviceResponse.error(error instanceof Error ? error : new Error('Unknown error'));
  }
}

/**
 * Get test runs for a project with pagination
 */
export async function getTestRunsByProject(
  projectId: string,
  page = 1,
  limit = 10
): Promise<ServiceResponse<{ testRuns: TestRun[]; total: number }>> {
  try {
    await authUtils.requireAuth();

    const skip = (page - 1) * limit;

    const [testRuns, total] = await Promise.all([
      prisma.testRun.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          testRunCases: {
            include: {
              testCase: {
                select: { title: true }
              }
            }
          }
        }
      }),
      prisma.testRun.count({
        where: { projectId }
      })
    ]);

    return serviceResponse.success({ testRuns, total });
  } catch (error) {
    return serviceResponse.error(error instanceof Error ? error : new Error('Unknown error'));
  }
}

/**
 * Get real-time test run status with counts
 */
export async function getTestRunStatus(
  runId: string
): Promise<ServiceResponse<{
  status: string;
  total: number;
  passed: number;
  failed: number;
  pending: number;
  skipped: number;
}>> {
  try {
    await authUtils.requireAuth();

    const testRun = await prisma.testRun.findUnique({
      where: { id: runId },
      include: {
        testRunCases: {
          include: {
            result: true
          }
        }
      }
    }) as TestRunWithResults | null;

    if (!testRun) {
      throw ErrorFactory.create('NOT_FOUND', 'Test run not found');
    }

    const results = testRun.testRunCases.map(trc => 
      (trc.result?.status || 'PENDING') as TestResultStatus
    );
    
    return serviceResponse.success({
      status: testRun.status,
      total: results.length,
      passed: results.filter(r => r === 'PASSED').length,
      failed: results.filter(r => r === 'FAILED').length,
      pending: results.filter(r => r === 'PENDING').length,
      skipped: results.filter(r => r === 'SKIPPED').length
    });
  } catch (error) {
    return serviceResponse.error(error instanceof Error ? error : new Error('Unknown error'));
  }
}

/**
 * Aggregate test results with detailed metrics
 */
export async function aggregateTestResults(
  runId: string
): Promise<ServiceResponse<{
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
  failureAnalysis: {
    criticalFailures: number;
    regressions: number;
  };
}>> {
  try {
    await authUtils.requireAuth();

    const testRun = await prisma.testRun.findUnique({
      where: { id: runId },
      include: {
        testRunCases: {
          include: {
            testCase: true,
            result: true
          }
        }
      }
    }) as TestRunWithResults | null;

    if (!testRun) {
      throw ErrorFactory.create('NOT_FOUND', 'Test run not found');
    }

    const results: TestResultSummary[] = testRun.testRunCases.map(trc => ({
      status: (trc.result?.status || 'PENDING') as TestResultStatus,
      priority: trc.testCase.priority,
      startTime: trc.result?.createdAt,
      endTime: trc.result?.completedAt
    }));

    const duration = testRun.completedAt && testRun.createdAt 
      ? testRun.completedAt.getTime() - testRun.createdAt.getTime()
      : 0;

    return serviceResponse.success({
      summary: {
        total: results.length,
        passed: results.filter(r => r.status === 'PASSED').length,
        failed: results.filter(r => r.status === 'FAILED').length,
        skipped: results.filter(r => r.status === 'SKIPPED').length,
        duration
      },
      failureAnalysis: {
        criticalFailures: results.filter(r => r.status === 'FAILED' && r.priority === 'HIGH').length,
        regressions: results.filter(r => r.status === 'FAILED' && r.priority === 'MEDIUM').length
      }
    });
  } catch (error) {
    return serviceResponse.error(error instanceof Error ? error : new Error('Unknown error'));
  }
}

/**
 * Get test run performance metrics
 */
export async function getTestRunMetrics(
  runId: string
): Promise<ServiceResponse<{
  executionTime: number;
  averageTestDuration: number;
  slowestTests: TestDuration[];
  testDistribution: {
    automated: number;
    manual: number;
    total: number;
  };
}>> {
  try {
    await authUtils.requireAuth();

    const testRun = await prisma.testRun.findUnique({
      where: { id: runId },
      include: {
        testRunCases: {
          include: {
            testCase: true,
            testCaseResults: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    }) as TestRunWithCases | null;

    if (!testRun) {
      throw ErrorFactory.create('NOT_FOUND', 'Test run not found');
    }

    const testDurations: TestDuration[] = testRun.testRunCases
      .map(trc => {
        const result = trc.testCaseResults[0];
        if (!result?.completedAt || !result.createdAt) return null;
        return {
          testCaseId: trc.testCaseId,
          duration: result.completedAt.getTime() - result.createdAt.getTime()
        };
      })
      .filter((d): d is TestDuration => d !== null)
      .sort((a, b) => b.duration - a.duration);

    const totalDuration = testDurations.reduce((sum, d) => sum + d.duration, 0);
    const averageDuration = testDurations.length ? totalDuration / testDurations.length : 0;

    return serviceResponse.success({
      executionTime: totalDuration,
      averageTestDuration: averageDuration,
      slowestTests: testDurations.slice(0, 5),
      testDistribution: {
        automated: testRun.testRunCases.filter(trc => trc.testCase.status === 'AUTOMATED').length,
        manual: testRun.testRunCases.filter(trc => trc.testCase.status === 'MANUAL').length,
        total: testRun.testRunCases.length
      }
    });
  } catch (error) {
    return serviceResponse.error(error instanceof Error ? error : new Error('Unknown error'));
  }
} 