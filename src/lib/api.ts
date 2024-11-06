import { logger } from '@/lib/utils/logger';
import { prisma } from '@/lib/prisma';
import type { 
  TestCase, 
  TestRun, 
  TestRunCase, 
  TestCaseResult,
  Prisma 
} from '@prisma/client';

interface TestCaseFilters {
  title?: string;
  status?: string;
  priority?: string;
}

type TestRunWithRelations = TestRun & {
  testRunCases: Array<TestRunCase & {
    testCase: TestCase;
  }>;
  results: TestCaseResult[];
};

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function getTestRuns(projectId: string): Promise<TestRunWithRelations[]> {
  try {
    logger.info('Fetching test runs', { projectId });

    const testRuns = await prisma.testRun.findMany({
      where: { projectId },
      include: {
        testRunCases: {
          include: {
            testCase: true,
          },
        },
        results: true,
      },
    });

    logger.info('Successfully fetched test runs', { 
      projectId, 
      count: testRuns.length 
    });

    return testRuns.map(testRun => ({
      ...testRun,
      testRunCases: testRun.testRunCases.map(trc => ({
        ...trc,
        testCase: {
          ...trc.testCase,
          description: trc.testCase.description ?? '',
          expectedResult: trc.testCase.expectedResult ?? '',
        },
      })),
      results: testRun.results.map(result => ({
        ...result,
        notes: result.notes ?? '',
      })),
    }));
  } catch (error) {
    logger.error('Failed to fetch test runs', {
      projectId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new ApiError(500, 'Failed to fetch test runs');
  }
}

export async function fetchTestCases(
  projectId: string,
  filters: TestCaseFilters = {}
): Promise<TestCase[]> {
  try {
    logger.info('Fetching test cases', { projectId, filters });

    const searchParams = new URLSearchParams();
    if (filters.title) searchParams.append('title', filters.title);
    if (filters.status) searchParams.append('status', filters.status);
    if (filters.priority) searchParams.append('priority', filters.priority);

    const response = await fetch(
      `/api/projects/${projectId}/test-cases?${searchParams.toString()}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const testCases = await response.json();
    logger.info('Successfully fetched test cases', {
      projectId,
      count: testCases.length,
      filters,
    });

    return testCases;
  } catch (error) {
    logger.error('Failed to fetch test cases', {
      projectId,
      filters,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new ApiError(500, 'Failed to fetch test cases');
  }
}

export async function getTestCase(projectId: string, testCaseId: string): Promise<TestCase> {
  try {
    logger.info('Fetching test case', { projectId, testCaseId });

    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
    });

    if (!testCase) {
      logger.warn('Test case not found', { projectId, testCaseId });
      throw new ApiError(404, 'Test case not found');
    }

    logger.info('Successfully fetched test case', { projectId, testCaseId });
    return testCase;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    logger.error('Failed to fetch test case', {
      projectId,
      testCaseId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new ApiError(500, 'Failed to fetch test case');
  }
}

export async function updateTestCase(
  projectId: string,
  testCaseId: string,
  data: Prisma.TestCaseUpdateInput
): Promise<TestCase> {
  try {
    logger.info('Updating test case', { projectId, testCaseId, data });

    const testCase = await prisma.testCase.update({
      where: { id: testCaseId },
      data,
    });

    logger.info('Successfully updated test case', { projectId, testCaseId });
    return testCase;
  } catch (error) {
    logger.error('Failed to update test case', {
      projectId,
      testCaseId,
      data,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new ApiError(500, 'Failed to update test case');
  }
}

export async function deleteTestCase(projectId: string, testCaseId: string): Promise<void> {
  try {
    logger.info('Deleting test case', { projectId, testCaseId });

    await prisma.testCase.delete({
      where: { id: testCaseId },
    });

    logger.info('Successfully deleted test case', { projectId, testCaseId });
  } catch (error) {
    logger.error('Failed to delete test case', {
      projectId,
      testCaseId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new ApiError(500, 'Failed to delete test case');
  }
}
