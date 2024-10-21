import { PrismaClient } from '@prisma/client';
import logger from './logger';

const prisma = new PrismaClient();

type TestCase = {
  id: string;
  title: string;
  description: string;
  expectedResult: string;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
};

type TestCaseResult = {
  id: string;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type TestRun = {
  id: string;
  name: string;
  status: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  testCases: TestCase[];
  testCaseResults: TestCaseResult[];
};

type TestSuite = {
  id: string;
  name: string;
  description: string | null;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  testCases: TestCase[];
};

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
    return testRuns.map((testRun) => ({
      ...testRun,
      createdAt: testRun.createdAt,
      updatedAt: testRun.updatedAt,
      testCases: testRun.testCases.map((tc) => ({
        ...tc,
        createdAt: tc.createdAt,
        updatedAt: tc.updatedAt,
        description: tc.description ?? '',
        expectedResult: tc.expectedResult ?? '',
      })),
      testCaseResults: testRun.testCaseResults.map((tcr) => ({
        ...tcr,
        createdAt: tcr.createdAt,
        updatedAt: tcr.updatedAt,
        notes: tcr.notes ?? '',
      })),
    }));
  } catch (error) {
    logger.error(`Error fetching test runs for project ${projectId}:`, error);
    throw error;
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

    logger.info(
      `Found ${testSuites.length} test suites for project ${projectId}`
    );
    return testSuites.map((testSuite) => ({
      ...testSuite,
      createdAt: testSuite.createdAt,
      updatedAt: testSuite.updatedAt,
      description: testSuite.description ?? '',
      testCases:
        testSuite.testCases?.map((tc) => ({
          ...tc,
          createdAt: tc.createdAt,
          updatedAt: tc.updatedAt,
          description: tc.description ?? '',
          expectedResult: tc.expectedResult ?? '',
        })) ?? [],
    }));
  } catch (error) {
    logger.error(`Error fetching test suites for project ${projectId}:`, error);
    throw error;
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

// ... (keep other existing functions)
