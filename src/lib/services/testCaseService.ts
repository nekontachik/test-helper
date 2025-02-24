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
import type { TestCase, TestCaseVersion, Prisma } from '@prisma/client';
import { serviceResponse, type ServiceResponse } from '@/lib/utils/serviceResponse';
import { validateTestCase, validatePartialTestCase } from '@/lib/validation/schemas';
import type { TestCaseInput, TestCaseUpdateInput } from '@/lib/validation/schemas';
import { ErrorFactory } from '@/lib/errors/BaseError';
import { authUtils } from '@/lib/utils/authUtils';
import { versionUtils } from '@/lib/utils/versionUtils';

export type { TestCaseInput as TestCaseData };

/**
 * Create a new test case with versioning
 */
export async function createTestCase(
  projectId: string, 
  data: TestCaseInput
): Promise<ServiceResponse<TestCase>> {
  try {
    const session = await authUtils.requireAuth();
    const validatedData = validateTestCase({ ...data, projectId });

    const testCase = await prisma.$transaction(async (tx) => {
      const created = await tx.testCase.create({
        data: {
          ...validatedData,
          userId: session.user.id,
          currentVersion: 1
        }
      });

      await versionUtils.createVersion(
        tx as Prisma.TransactionClient,
        {
          testCaseId: created.id,
          versionNumber: 1,
          changes: 'Initial version',
          data: validatedData,
          authorId: session.user.id
        }
      );

      return created;
    });

    return serviceResponse.success(testCase);
  } catch (error) {
    return serviceResponse.error(error instanceof Error ? error : new Error('Unknown error'));
  }
}

/**
 * Update test case with version tracking
 */
export async function updateTestCase(
  id: string,
  data: TestCaseUpdateInput,
  changes: string
): Promise<ServiceResponse<TestCase>> {
  try {
    const session = await authUtils.requireAuth();
    const validatedData = validatePartialTestCase(data);

    const testCase = await prisma.$transaction(async (tx) => {
      const existing = await tx.testCase.findUnique({ 
        where: { id }
      });
      
      if (!existing) {
        throw ErrorFactory.create('NOT_FOUND', 'Test case not found');
      }

      // Merge existing data with updates
      const mergedData: TestCaseInput = {
        title: validatedData.title || existing.title,
        description: validatedData.description || existing.description || undefined,
        steps: validatedData.steps || existing.steps,
        expectedResult: validatedData.expectedResult || existing.expectedResult,
        status: (validatedData.status || existing.status) as TestCaseInput['status'],
        priority: (validatedData.priority || existing.priority) as TestCaseInput['priority'],
        projectId: existing.projectId
      };

      const updated = await tx.testCase.update({
        where: { id },
        data: {
          ...validatedData,
          currentVersion: { increment: 1 }
        }
      });

      await versionUtils.createVersion(
        tx,
        {
          testCaseId: id,
          versionNumber: updated.currentVersion,
          changes,
          data: mergedData,
          authorId: session.user.id
        }
      );

      return updated;
    });

    return serviceResponse.success(testCase);
  } catch (error) {
    return serviceResponse.error(error instanceof Error ? error : new Error('Unknown error'));
  }
}

/**
 * Bulk create test cases
 */
export async function bulkCreateTestCases(
  projectId: string,
  testCases: TestCaseInput[]
): Promise<ServiceResponse<TestCase[]>> {
  try {
    const session = await authUtils.requireAuth();
    
    const createdTestCases = await prisma.$transaction(async (tx) => {
      return Promise.all(testCases.map(async (data) => {
        const validatedData = validateTestCase({ ...data, projectId });
        
        const testCase = await tx.testCase.create({
          data: {
            ...validatedData,
            userId: session.user.id,
            currentVersion: 1
          }
        });

        await versionUtils.createVersion(
          tx as Prisma.TransactionClient,
          {
            testCaseId: testCase.id,
            versionNumber: 1,
            changes: 'Initial version',
            data: validatedData,
            authorId: session.user.id
          }
        );

        return testCase;
      }));
    });

    return serviceResponse.success(createdTestCases);
  } catch (error) {
    return serviceResponse.error(error instanceof Error ? error : new Error('Unknown error'));
  }
}

/**
 * Get test case version history
 */
export async function getTestCaseVersions(
  testCaseId: string
): Promise<ServiceResponse<TestCaseVersion[]>> {
  try {
    await authUtils.requireAuth();

    const versions = await prisma.testCaseVersion.findMany({
      where: { testCaseId },
      orderBy: { versionNumber: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    return serviceResponse.success(versions);
  } catch (error) {
    return serviceResponse.error(error instanceof Error ? error : new Error('Unknown error'));
  }
}

/**
 * Restore test case to specific version
 */
export async function restoreTestCaseVersion(
  testCaseId: string,
  versionNumber: number
): Promise<ServiceResponse<TestCase>> {
  try {
    const session = await authUtils.requireAuth();

    const result = await prisma.$transaction(async (tx) => {
      const version = await tx.testCaseVersion.findFirst({
        where: { testCaseId, versionNumber }
      });

      if (!version) {
        throw ErrorFactory.create('NOT_FOUND', 'Version not found');
      }

      const versionData = versionUtils.parseVersionData({ data: version.data as string });

      const updated = await tx.testCase.update({
        where: { id: testCaseId },
        data: {
          ...versionData,
          currentVersion: { increment: 1 }
        }
      });

      await versionUtils.createVersion(
        tx as Prisma.TransactionClient,
        {
          testCaseId,
          versionNumber: updated.currentVersion,
          changes: `Restored from version ${versionNumber}`,
          data: versionData,
          authorId: session.user.id
        }
      );

      return updated;
    });

    return serviceResponse.success(result);
  } catch (error) {
    return serviceResponse.error(error instanceof Error ? error : new Error('Unknown error'));
  }
} 