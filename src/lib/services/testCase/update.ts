import { prisma } from '@/lib/prisma';
import { serviceResponse, type ServiceResponse } from '@/lib/utils/serviceResponse';
import { validatePartialTestCase } from '@/lib/validation/schemas';
import { ErrorFactory } from '@/lib/errors/BaseError';
import { authUtils } from '@/lib/utils/authUtils';
import { versionUtils } from '@/lib/utils/versionUtils';
import type { 
  TestCase, 
  TestCaseUpdateInput, 
  TestCaseStatus, 
  TestCasePriority,
  TestCasePrismaUpdateInput
} from './types';
import type { Prisma } from '@prisma/client';

/**
 * Update a test case
 * @param id - ID of the test case to update
 * @param data - Test case update data
 * @param changes - Description of changes made
 * @returns ServiceResponse with the updated test case or error
 */
export async function updateTestCase(
  id: string,
  data: TestCaseUpdateInput,
  changes: string
): Promise<ServiceResponse<TestCase>> {
  try {
    const session = await authUtils.requireAuth();
    const validatedData = validatePartialTestCase(data);
    
    // Create a properly typed update object for Prisma
    const updateData: TestCasePrismaUpdateInput = {
      currentVersion: { increment: 1 }
    };
    
    // Only add fields that are defined
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.steps !== undefined) updateData.steps = validatedData.steps;
    if (validatedData.expectedResult !== undefined) updateData.expectedResult = validatedData.expectedResult;
    if (validatedData.status !== undefined) updateData.status = validatedData.status as TestCaseStatus;
    if (validatedData.priority !== undefined) updateData.priority = validatedData.priority as TestCasePriority;
    if (validatedData.description !== undefined) updateData.description = validatedData.description ?? null;
    if (validatedData.actualResult !== undefined) updateData.actualResult = validatedData.actualResult ?? '';

    const testCase = await prisma.$transaction(async (tx) => {
      const existing = await tx.testCase.findUnique({
        where: { id }
      });

      if (!existing) {
        throw ErrorFactory.create('NOT_FOUND', 'Test case not found');
      }

      const updated = await tx.testCase.update({
        where: { id },
        data: updateData
      });

      // Create a complete data object for versioning that matches TestCaseInput
      const versionData = {
        title: validatedData.title ?? existing.title,
        steps: validatedData.steps ?? existing.steps,
        expectedResult: validatedData.expectedResult ?? existing.expectedResult,
        status: (validatedData.status ?? existing.status) as TestCaseStatus,
        priority: (validatedData.priority ?? existing.priority) as TestCasePriority,
        description: validatedData.description !== undefined 
          ? validatedData.description 
          : (existing.description || undefined),
        tags: [] // Add empty tags array to match TestCaseInput schema
      };

      await versionUtils.createVersion(
        tx as Prisma.TransactionClient,
        {
          testCaseId: id,
          versionNumber: updated.currentVersion,
          changes,
          data: versionData,
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
        : ErrorFactory.create('INTERNAL_ERROR', 'Failed to update test case')
    );
  }
} 