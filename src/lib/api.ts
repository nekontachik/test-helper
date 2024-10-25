import logger from './logger';
import { PrismaClient, TestCase as PrismaTestCase, TestRun as PrismaTestRun, TestSuite as PrismaTestSuite } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export interface TestCase extends PrismaTestCase {}

interface TestCaseResult {
  id: string;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TestRun extends PrismaTestRun {
  testCases: TestCase[];
  testCaseResults: TestCaseResult[];
}

interface TestSuite extends PrismaTestSuite {
  testCases: TestCase[];
}

interface TestCaseFilters {
  title?: string;
  status?: string;
  priority?: string;
}

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function getTestRuns(projectId: string): Promise<TestRun[]> {
  try {
    logger.info(`Fetching test runs for project ${projectId}`);
    const testRuns = await prisma.testRun.findMany({
      where: { projectId },
      include: {
        testCases: true,
        testCaseResults: true,
      },
    });

    logger.info(`Found ${testRuns.length} test runs for project ${projectId}`);
    return testRuns.map((testRun: PrismaTestRun & { testCases: PrismaTestCase[]; testCaseResults: TestCaseResult[] }) => ({
      ...testRun,
      testCases: testRun.testCases.map(tc => ({
        ...tc,
        description: tc.description ?? '',
        expectedResult: tc.expectedResult ?? '',
      })),
      testCaseResults: testRun.testCaseResults.map(tcr => ({
        ...tcr,
        notes: tcr.notes ?? '',
      })),
    }));
  } catch (error) {
    logger.error(`Error fetching test runs for project ${projectId}:`, error);
    throw new ApiError(500, `Failed to fetch test runs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getTestSuites(projectId: string): Promise<TestSuite[]> {
  try {
    logger.info(`Fetching test suites for project ${projectId}`);
    const testSuites = await prisma.testSuite.findMany({
      where: { projectId },
      include: {
        testCases: true,
      },
    });

    logger.info(`Found ${testSuites.length} test suites for project ${projectId}`);
    return testSuites.map((testSuite: PrismaTestSuite & { testCases: PrismaTestCase[] }) => ({
      ...testSuite,
      testCases: testSuite.testCases?.map(tc => ({
        ...tc,
        description: tc.description ?? '',
        expectedResult: tc.expectedResult ?? '',
      })) ?? [],
    }));
  } catch (error) {
    logger.error(`Error fetching test suites for project ${projectId}:`, error);
    throw new ApiError(500, `Failed to fetch test suites: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetchTestCases(
  projectId: string,
  filters: { title?: string; status?: string; priority?: string } = {}
): Promise<TestCase[]> {
  const searchParams = new URLSearchParams();
  if (filters.title) searchParams.append('title', filters.title);
  if (filters.status) searchParams.append('status', filters.status);
  if (filters.priority) searchParams.append('priority', filters.priority);

  const response = await fetch(
    `/api/projects/${projectId}/test-cases?${searchParams.toString()}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch test cases');
  }
  return response.json();
}

export async function getTestCase(projectId: string, testCaseId: string): Promise<TestCase> {
  const testCase = await prisma.testCase.findUnique({
    where: { id: testCaseId, projectId },
  });
  if (!testCase) {
    throw new Error('Test case not found');
  }
  return testCase as TestCase;
}

export async function updateTestCase(projectId: string, testCaseId: string, testCase: Partial<TestCase>): Promise<TestCase> {
  const updatedTestCase = await prisma.testCase.update({
    where: { id: testCaseId, projectId },
    data: testCase,
  });
  return updatedTestCase as TestCase;
}

export async function deleteTestCase(projectId: string, testCaseId: string): Promise<void> {
  await prisma.testCase.delete({
    where: { id: testCaseId, projectId },
  });
}

// ... (keep other existing functions)
