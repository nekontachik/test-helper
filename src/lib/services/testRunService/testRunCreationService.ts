import type { TestRun } from '@prisma/client';
import { serviceResponse, type ServiceResponse } from '@/lib/utils/serviceResponse';
import { authUtils } from '@/lib/utils/authUtils';
import type { TestRunInput } from '@/lib/types/testRun';
import { logger } from '@/lib/logger';
import * as queries from './queries';

/**
 * Create a new test run
 */
export async function createTestRun(data: TestRunInput): Promise<ServiceResponse<TestRun>> {
  try {
    const session = await authUtils.requireAuth();
    
    const createData = {
      name: data.title, // Map title from input to name for DB
      description: data.description === null ? undefined : data.description,
      status: 'PENDING', // Default status for new test runs
      projectId: data.projectId,
      testCaseIds: data.testCaseIds,
      createdById: session.user.id
    };
    
    const testRun = await queries.createTestRun(createData);
    return serviceResponse.success(testRun);
  } catch (error) {
    logger.error('Error creating test run:', error);
    return serviceResponse.error(
      error instanceof Error ? new Error(error.message) : new Error('Failed to create test run')
    );
  }
} 