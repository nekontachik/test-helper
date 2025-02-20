/**
 * Test Case Service
 * 
 * Provides functionality for:
 * - Test case versioning
 * - Bulk operations
 * - Test case templates
 * - Import/Export
 */

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BaseError } from '@/lib/errors/BaseError';
import type { TestCaseStatus, TestCasePriority } from '@/types';

export interface TestCaseData {
  title: string;
  description?: string;
  steps: string[];
  expectedResult: string;
  status: TestCaseStatus;
  priority: TestCasePriority;
  tags?: string[];
}

export interface TestCaseVersion {
  id: string;
  versionNumber: number;
  changes: string;
  data: string;
  userId: string;
  testCaseId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestCaseWithVersion extends TestCaseData {
  id: string;
  projectId: string;
  userId: string;
  currentVersion: number;
  versions?: TestCaseVersion[];
}

/**
 * Create a new test case with versioning
 */
export async function createTestCase(
  projectId: string, 
  data: TestCaseData
): Promise<TestCaseWithVersion> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new BaseError('Not authenticated', {
      code: 'UNAUTHORIZED',
      status: 401
    });
  }

  return prisma.$transaction(async (tx) => {
    // Create test case
    const testCase = await tx.testCase.create({
      data: {
        ...data,
        steps: JSON.stringify(data.steps),
        projectId,
        userId: session.user.id,
        currentVersion: 1,
      },
    });

    // Create initial version
    await tx.testCaseVersion.create({
      data: {
        testCaseId: testCase.id,
        versionNumber: 1,
        changes: 'Initial version',
        data: JSON.stringify(data),
        userId: session.user.id,
      },
    });

    return testCase as TestCaseWithVersion;
  });
}

/**
 * Update test case with version tracking
 */
export async function updateTestCase(
  testCaseId: string, 
  data: Partial<TestCaseData>,
  changes: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new BaseError('Not authenticated', {
      code: 'UNAUTHORIZED',
      status: 401
    });
  }

  return prisma.$transaction(async (tx) => {
    // Get current test case
    const testCase = await tx.testCase.findUnique({
      where: { id: testCaseId },
      include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } }
    });

    if (!testCase) {
      throw new BaseError('Test case not found', {
        code: 'NOT_FOUND',
        status: 404
      });
    }

    const newVersionNumber = testCase.currentVersion + 1;

    // Create new version
    await tx.testCaseVersion.create({
      data: {
        testCaseId,
        versionNumber: newVersionNumber,
        changes,
        data: JSON.stringify({ ...testCase, ...data }),
        userId: session.user.id,
      },
    });

    // Update test case
    return tx.testCase.update({
      where: { id: testCaseId },
      data: {
        ...data,
        steps: data.steps ? JSON.stringify(data.steps) : undefined,
        currentVersion: newVersionNumber,
      },
    });
  });
}

/**
 * Bulk create test cases
 */
export async function bulkCreateTestCases(
  projectId: string,
  testCases: TestCaseData[]
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new BaseError('Not authenticated', {
      code: 'UNAUTHORIZED',
      status: 401
    });
  }

  return prisma.$transaction(async (tx) => {
    const createdTestCases = [];

    for (const data of testCases) {
      const testCase = await tx.testCase.create({
        data: {
          ...data,
          steps: JSON.stringify(data.steps),
          projectId,
          userId: session.user.id,
          currentVersion: 1,
        },
      });

      await tx.testCaseVersion.create({
        data: {
          testCaseId: testCase.id,
          versionNumber: 1,
          changes: 'Initial version',
          data: JSON.stringify(data),
          userId: session.user.id,
        },
      });

      createdTestCases.push(testCase);
    }

    return createdTestCases;
  });
}

/**
 * Get test case version history
 */
export async function getTestCaseVersions(testCaseId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new BaseError('Not authenticated', {
      code: 'UNAUTHORIZED',
      status: 401
    });
  }

  const versions = await prisma.testCaseVersion.findMany({
    where: { testCaseId },
    orderBy: { versionNumber: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return versions.map(version => ({
    ...version,
    data: JSON.parse(version.data) as TestCaseData,
  }));
}

/**
 * Restore test case to specific version
 */
export async function restoreTestCaseVersion(
  testCaseId: string,
  versionNumber: number
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new BaseError('Not authenticated', {
      code: 'UNAUTHORIZED',
      status: 401
    });
  }

  return prisma.$transaction(async (tx) => {
    try {
      // Get specified version
      const version = await tx.testCaseVersion.findFirst({
        where: { testCaseId, versionNumber },
      });

      if (!version) {
        throw new BaseError('Version not found', {
          code: 'NOT_FOUND',
          status: 404
        });
      }

      const versionData = JSON.parse(version.data) as TestCaseData;
      if (!isValidTestCaseData(versionData)) {
        throw new BaseError('Invalid version data', {
          code: 'INVALID_DATA',
          status: 400
        });
      }
      const newVersionNumber = version.versionNumber + 1;

      // Create new version
      await tx.testCaseVersion.create({
        data: {
          testCaseId,
          versionNumber: newVersionNumber,
          changes: `Restored from version ${versionNumber}`,
          data: version.data as string,
          userId: session.user.id,
        },
      });

      // Update test case
      return tx.testCase.update({
        where: { id: testCaseId },
        data: {
          ...versionData,
          currentVersion: newVersionNumber,
        },
      });
    } catch (error) {
      // Log the error
      throw new BaseError('Failed to restore version', {
        code: 'TRANSACTION_ERROR',
        status: 500,
        cause: error
      });
    }
  });
}

// Add type guard for version data
function isValidTestCaseData(data: unknown): data is TestCaseData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'title' in data &&
    'steps' in data &&
    'expectedResult' in data &&
    'status' in data &&
    'priority' in data
  );
} 