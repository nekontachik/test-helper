import { prisma } from '@/lib/prisma';
import { serviceResponse, type ServiceResponse } from '@/lib/utils/serviceResponse';
import { validateTestCase } from '@/lib/validation/schemas';
import { ErrorFactory } from '@/lib/errors/BaseError';
import { authUtils } from '@/lib/utils/authUtils';
import { versionUtils } from '@/lib/utils/versionUtils';
import type { Prisma } from '@prisma/client';
import type { 
  TestCase, 
  TestCaseInput, 
  TestCaseStatus, 
  TestCasePriority,
  TestCasePrismaCreateInput
} from './types';

/**
 * Create a new test case
 * @param projectId - ID of the project to create the test case in
 * @param data - Test case data
 * @returns ServiceResponse with the created test case or error
 */
export async function createTestCase(
  projectId: string, 
  data: TestCaseInput
): Promise<ServiceResponse<TestCase>> {
  try {
    const session = await authUtils.requireAuth();
    const validatedData = validateTestCase({ ...data, projectId });

    // Use Prisma's expected input types
    const prismaData: TestCasePrismaCreateInput = {
      title: validatedData.title,
      steps: validatedData.steps,
      expectedResult: validatedData.expectedResult,
      status: validatedData.status as TestCaseStatus,
      priority: validatedData.priority as TestCasePriority,
      projectId: validatedData.projectId,
      description: validatedData.description ?? null,
      actualResult: validatedData.actualResult ?? '',
      currentVersion: 1,
      userId: session.user.id
    };

    const testCase = await prisma.$transaction(async (tx) => {
      const created = await tx.testCase.create({
        data: prismaData
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
    return serviceResponse.error(
      error instanceof Error 
        ? ErrorFactory.create('INTERNAL_ERROR', error.message) 
        : ErrorFactory.create('INTERNAL_ERROR', 'Failed to create test case')
    );
  }
}

/**
 * Bulk create test cases
 * @param projectId - ID of the project to create the test cases in
 * @param testCases - Array of test case data
 * @returns ServiceResponse with the created test cases or error
 */
export async function bulkCreateTestCases(
  projectId: string,
  testCases: TestCaseInput[]
): Promise<ServiceResponse<TestCase[]>> {
  try {
    const session = await authUtils.requireAuth();
    const createdTestCases: TestCase[] = [];

    for (const data of testCases) {
      const validatedData = validateTestCase({ ...data, projectId });
      
      // Use Prisma's expected input types
      const prismaData: TestCasePrismaCreateInput = {
        title: validatedData.title,
        steps: validatedData.steps,
        expectedResult: validatedData.expectedResult,
        status: validatedData.status as TestCaseStatus,
        priority: validatedData.priority as TestCasePriority,
        projectId: validatedData.projectId,
        description: validatedData.description ?? null,
        actualResult: validatedData.actualResult ?? '',
        currentVersion: 1,
        userId: session.user.id
      };
        
      const testCase = await prisma.$transaction(async (tx) => {
        const created = await tx.testCase.create({
          data: prismaData
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

      createdTestCases.push(testCase);
    }

    return serviceResponse.success(createdTestCases);
  } catch (error) {
    return serviceResponse.error(
      error instanceof Error 
        ? ErrorFactory.create('INTERNAL_ERROR', error.message) 
        : ErrorFactory.create('INTERNAL_ERROR', 'Failed to create test cases')
    );
  }
} 