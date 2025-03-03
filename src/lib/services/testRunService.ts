import { prisma } from '@/lib/prisma';
import type { TestRun, Prisma, TestCase, User, TestCaseResult } from '@prisma/client';
import { serviceResponse, type ServiceResponse } from '@/lib/utils/serviceResponse';
import { authUtils } from '@/lib/utils/authUtils';
import { ErrorFactory } from '@/lib/errors/BaseError';
import type { 
  TestRunWithCases,
  TestRunInput,
  TestResultStatus,
  TestResultSummary
} from '@/lib/types/testRun';

// Define the TestRunCase type to match Prisma schema
type TestRunCase = {
  id: string;
  testRunId: string;
  testCaseId: string;
  status: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  testCase: {
    id: string;
    title: string;
    priority: string;
    status: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    description: string | null;
    steps: string;
    expectedResult: string;
    actualResult: string;
    projectId: string;
    currentVersion: number;
    deleted: boolean;
  };
  user: User;
};

// Define the TestRunWithResults type to match Prisma schema
type TestRunWithResults = TestRun & {
  testRunCases: TestRunCase[];
  testResults: TestCaseResult[];
};

interface TestDuration {
  testCaseId: string;
  duration: number;
}

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

      const createData: Prisma.TestRunCreateInput = {
        name: data.title,
        project: { connect: { id: data.projectId } },
        status: 'PENDING',
        user: { connect: { id: session.user.id } },
        testRunCases: {
          create: data.testCaseIds.map(testCaseId => ({
            testCase: { connect: { id: testCaseId } },
            status: 'PENDING',
            user: { connect: { id: session.user.id } }
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
          testRunCases: {
            include: {
              testCase: true,
              user: true
            }
          }
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
        include: {
          testRunCases: true
        }
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
          executedById: session.user.id
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
export async function getTestRunDetails(runId: string): Promise<ServiceResponse<TestRunWithCases>> {
  try {
    await authUtils.requireAuth();

    const testRun = await prisma.testRun.findUnique({
      where: { id: runId },
      include: {
        testRunCases: {
          include: {
            testCase: true,
            user: true
          }
        },
        testResults: true
      }
    }) as TestRunWithResults | null;

    if (!testRun) {
      throw ErrorFactory.create('NOT_FOUND', 'Test run not found');
    }

    const transformedTestRun: TestRunWithCases = {
      ...testRun,
      testRunCases: testRun.testRunCases.map((trc: TestRunCase) => ({
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
        testCaseResults: testRun.testResults.filter(r => r.testCaseId === trc.testCaseId)
      }))
    };

    return serviceResponse.success(transformedTestRun);
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
export async function getTestRunStatus(runId: string): Promise<ServiceResponse<{
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
            testCase: {
              select: {
                id: true,
                status: true
              }
            }
          }
        },
        testResults: {
          select: {
            testCaseId: true,
            status: true
          }
        }
      }
    }) as TestRunWithResults | null;

    if (!testRun) {
      throw ErrorFactory.create('NOT_FOUND', 'Test run not found');
    }

    const results = testRun.testRunCases.map((trc: TestRunCase) => {
      const result = testRun.testResults.find(r => r.testCaseId === trc.testCaseId);
      return (result?.status || 'PENDING') as TestResultStatus;
    });
    
    return serviceResponse.success({
      status: testRun.status,
      total: results.length,
      passed: results.filter((r: TestResultStatus) => r === 'PASSED').length,
      failed: results.filter((r: TestResultStatus) => r === 'FAILED').length,
      pending: results.filter((r: TestResultStatus) => r === 'PENDING').length,
      skipped: results.filter((r: TestResultStatus) => r === 'SKIPPED').length
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
            testCase: true
          }
        },
        testResults: {
          select: {
            testCaseId: true,
            status: true,
            createdAt: true,
            executedAt: true
          }
        }
      }
    }) as (TestRun & {
      testRunCases: Array<{
        testCase: TestCase;
      }>;
      testResults: Array<{
        testCaseId: string;
        status: string;
        createdAt: Date;
        executedAt: Date;
      }>;
    }) | null;

    if (!testRun) {
      throw ErrorFactory.create('NOT_FOUND', 'Test run not found');
    }

    const results: TestResultSummary[] = testRun.testRunCases.map((trc) => {
      const result = testRun.testResults.find(r => r.testCaseId === trc.testCase.id);
      return {
        status: (result?.status || 'PENDING') as TestResultStatus,
        priority: trc.testCase.priority,
        startTime: result?.createdAt,
        endTime: result?.executedAt
      };
    });

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
export async function getTestRunMetrics(runId: string): Promise<ServiceResponse<{
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
            testCase: {
              select: {
                id: true,
                status: true
              }
            }
          }
        },
        testResults: {
          select: {
            testCaseId: true,
            createdAt: true,
            executedAt: true
          }
        }
      }
    }) as (TestRun & {
      testRunCases: Array<{
        testCase: {
          id: string;
          status: string;
        };
      }>;
      testResults: Array<{
        testCaseId: string;
        createdAt: Date;
        executedAt: Date;
      }>;
    }) | null;

    if (!testRun) {
      throw ErrorFactory.create('NOT_FOUND', 'Test run not found');
    }

    const testDurations: TestDuration[] = testRun.testRunCases
      .map((trc) => {
        const result = testRun.testResults.find(r => r.testCaseId === trc.testCase.id);
        if (!result?.executedAt || !result.createdAt) return null;
        return {
          testCaseId: trc.testCase.id,
          duration: result.executedAt.getTime() - result.createdAt.getTime()
        };
      })
      .filter((d): d is TestDuration => d !== null)
      .sort((a: TestDuration, b: TestDuration) => b.duration - a.duration);

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