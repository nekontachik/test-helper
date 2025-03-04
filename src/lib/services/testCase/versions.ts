import { prisma } from '@/lib/prisma';
import { serviceResponse, type ServiceResponse } from '@/lib/utils/serviceResponse';
import { ErrorFactory } from '@/lib/errors/BaseError';
import { authUtils } from '@/lib/utils/authUtils';
import { versionUtils } from '@/lib/utils/versionUtils';
import type { 
  TestCase, 
  TestCaseVersion, 
  TestCaseStatus, 
  TestCasePriority,
  TestCasePrismaUpdateInput
} from './types';
import type { Prisma } from '@prisma/client';

/**
 * Get test case versions
 * @param testCaseId - ID of the test case
 * @returns ServiceResponse with the test case versions or error
 */
export async function getTestCaseVersions(
  testCaseId: string
): Promise<ServiceResponse<TestCaseVersion[]>> {
  try {
    await authUtils.requireAuth();
     
    const versions = await prisma.testCaseVersion.findMany({
      where: { testCaseId },
      orderBy: { versionNumber: 'desc' }
    });
     
    return serviceResponse.success(versions);
  } catch (error) {
    return serviceResponse.error(
      error instanceof Error 
        ? ErrorFactory.create('INTERNAL_ERROR', error.message) 
        : ErrorFactory.create('INTERNAL_ERROR', 'Failed to get test case versions')
    );
  }
}

/**
 * Restore a test case version
 * @param testCaseId - ID of the test case
 * @param versionNumber - Version number to restore
 * @returns ServiceResponse with the restored test case or error
 */
export async function restoreTestCaseVersion(
  testCaseId: string,
  versionNumber: number
): Promise<ServiceResponse<TestCase>> {
  try {
    const session = await authUtils.requireAuth();
     
    const version = await prisma.testCaseVersion.findUnique({
      where: {
        testCaseId_versionNumber: {
          testCaseId,
          versionNumber
        }
      }
    });
     
    if (!version) {
      throw ErrorFactory.create('NOT_FOUND', 'Version not found');
    }
     
    const versionData = version.data as Record<string, unknown>;
    
    // Create a properly typed update object for Prisma
    const updateData: TestCasePrismaUpdateInput = {
      title: versionData.title as string,
      status: versionData.status as TestCaseStatus,
      steps: versionData.steps as string,
      expectedResult: versionData.expectedResult as string,
      priority: versionData.priority as TestCasePriority,
      description: (versionData.description as string) ?? null,
      actualResult: (versionData.actualResult as string) ?? '',
      currentVersion: { increment: 1 }
    };
     
    const testCase = await prisma.$transaction(async (tx) => {
      const updated = await tx.testCase.update({
        where: { id: testCaseId },
        data: updateData
      });
       
      // Create version data that matches TestCaseInput schema
      const versionInputData = {
        title: versionData.title as string,
        status: versionData.status as TestCaseStatus,
        steps: versionData.steps as string,
        expectedResult: versionData.expectedResult as string,
        priority: versionData.priority as TestCasePriority,
        description: versionData.description as string | undefined,
        tags: (versionData.tags as string[]) || []
      };
      
      await versionUtils.createVersion(
        tx as Prisma.TransactionClient,
        {
          testCaseId,
          versionNumber: updated.currentVersion,
          changes: `Restored from version ${versionNumber}`,
          data: versionInputData,
          authorId: session.user.id
        }
      );
       
      return updated;
    });
     
    return serviceResponse.success(testCase);
  } catch (error) {
    return serviceResponse.error(
      error instanceof Error 
        ? ErrorFactory.create('INTERNAL_ERROR', error.message) 
        : ErrorFactory.create('INTERNAL_ERROR', 'Failed to restore test case version')
    );
  }
} 