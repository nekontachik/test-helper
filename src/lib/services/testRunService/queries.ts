import { prisma } from '@/lib/prisma';
import type { TestRun, TestCase, Project } from '@prisma/client';
import { ErrorFactory } from '@/lib/errors/BaseError';
import type { TestRunWithResults } from './types';

/**
 * Find a test run by ID with related data
 */
export async function findTestRunById(runId: string): Promise<TestRunWithResults | null> {
  return prisma.testRun.findUnique({
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
  }) as Promise<TestRunWithResults | null>;
}

/**
 * Find test cases by IDs and project ID
 */
export async function findTestCasesByIds(
  testCaseIds: string[], 
  projectId: string
): Promise<TestCase[]> {
  return prisma.testCase.findMany({
    where: {
      id: { in: testCaseIds },
      projectId
    }
  });
}

/**
 * Find a project by ID
 */
export async function findProjectById(projectId: string): Promise<Project | null> {
  return prisma.project.findUnique({
    where: { id: projectId }
  });
}

/**
 * Create a new test run
 */
export async function createTestRun(data: {
  name: string;
  description?: string;
  status: string;
  projectId: string;
  createdById: string;
  testCaseIds: string[];
}): Promise<TestRun> {
  try {
    return await prisma.$transaction(async (tx) => {
      const testRun = await tx.testRun.create({
        data: {
          name: data.name,
          status: data.status,
          projectId: data.projectId,
          userId: data.createdById,
          ...(data.description ? { description: data.description } : {})
        }
      });

      if (data.testCaseIds.length > 0) {
        await tx.testRunCase.createMany({
          data: data.testCaseIds.map(testCaseId => ({
            testRunId: testRun.id,
            testCaseId,
            status: 'PENDING',
            userId: data.createdById
          }))
        });
      }

      return testRun;
    });
  } catch (error) {
    throw ErrorFactory.create('DATABASE_ERROR', 'Failed to create test run', { cause: error });
  }
}

/**
 * Find test runs by project ID with pagination
 */
export async function findTestRunsByProject(
  projectId: string,
  page = 1,
  limit = 10
): Promise<{ testRuns: TestRun[]; total: number }> {
  const skip = (page - 1) * limit;

  const [testRuns, total] = await Promise.all([
    prisma.testRun.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        testResults: true
      }
    }),
    prisma.testRun.count({
      where: { projectId }
    })
  ]);

  return { 
    testRuns: testRuns as unknown as TestRun[], 
    total 
  };
} 