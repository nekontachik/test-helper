import { prisma } from '@/lib/prisma';
import type { TestRun } from '@prisma/client';
import { serviceResponse, type ServiceResponse } from '@/lib/utils/serviceResponse';
import { authUtils } from '@/lib/utils/authUtils';
import { ErrorFactory } from '@/lib/errors/BaseError';
import type { TestRunWithCases, TestRunInput } from '@/lib/types/testRun';
import { logger } from '@/lib/logger';
import { TestRunService } from './TestRunService';
import * as queries from './queries';
import type { TestRunWithResults } from './types';

// Re-export the TestRunService class
export { TestRunService };

/**
 * Create a new test run
 */
export async function createTestRun(data: TestRunInput): Promise<ServiceResponse<TestRun>> {
  try {
    const session = await authUtils.requireAuth();
    
    // Handle optional description
    const createData = {
      name: data.title,
      status: 'PENDING',
      projectId: data.projectId,
      testCaseIds: data.testCaseIds,
      createdById: session.user.id,
      // Only include description if it's defined
      ...(data.description !== undefined && { description: data.description })
    };
    
    const testRun = await queries.createTestRun(createData);
    return serviceResponse.success(testRun);
  } catch (error) {
    logger.error('Error creating test run:', error);
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
    logger.error('Error executing test run:', error);
    return serviceResponse.error(error instanceof Error ? error : new Error('Unknown error'));
  }
}

/**
 * Get test run details with test cases and results
 */
export async function getTestRunDetails(runId: string): Promise<ServiceResponse<TestRunWithCases>> {
  try {
    await authUtils.requireAuth();
    const testRun = await queries.findTestRunById(runId);
    
    if (!testRun) {
      throw ErrorFactory.create('NOT_FOUND', 'Test run not found');
    }

    const transformedTestRun: TestRunWithCases = {
      ...testRun,
      testRunCases: testRun.testRunCases.map((trc: any) => ({
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
        testCaseResults: testRun.testResults.filter((r: any) => r.testCaseId === trc.testCaseId)
      }))
    };

    return serviceResponse.success(transformedTestRun);
  } catch (error) {
    logger.error('Error getting test run details:', error);
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
    const result = await queries.findTestRunsByProject(projectId, page, limit);
    return serviceResponse.success(result);
  } catch (error) {
    logger.error('Error getting test runs by project:', error);
    return serviceResponse.error(error instanceof Error ? error : new Error('Unknown error'));
  }
}

/**
 * Get test run summary with aggregated metrics
 */
export async function getTestRunSummary(
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
    });

    if (!testRun) {
      throw ErrorFactory.create('NOT_FOUND', 'Test run not found');
    }

    const results = testRun.testRunCases.map((trc) => {
      const result = testRun.testResults.find(r => r.testCaseId === trc.testCaseId);
      return result?.status || 'PENDING';
    });
    
    return serviceResponse.success({
      status: testRun.status,
      total: results.length,
      passed: results.filter(r => r === 'PASSED').length,
      failed: results.filter(r => r === 'FAILED').length,
      pending: results.filter(r => r === 'PENDING').length,
      skipped: results.filter(r => r === 'SKIPPED').length
    });
  } catch (error) {
    logger.error('Error getting test run summary:', error);
    return serviceResponse.error(error instanceof Error ? error : new Error('Unknown error'));
  }
} 