import type { TestRun } from '@prisma/client';
import { serviceResponse, type ServiceResponse } from '@/lib/utils/serviceResponse';
import { authUtils } from '@/lib/utils/authUtils';
import { logger } from '@/lib/logger';
import * as queries from './queries';
import { prisma } from '@/lib/prisma';

/**
 * Execute a test run
 */
export async function executeTestRun(runId: string): Promise<ServiceResponse<TestRun>> {
  try {
    const session = await authUtils.requireAuth();
    
    // Find the test run
    const testRun = await queries.findTestRunById(runId);
    
    if (!testRun) {
      return serviceResponse.error(
        new Error('Test run not found')
      );
    }
    
    // Check if the test run is already in progress or completed
    if (testRun.status === 'IN_PROGRESS' || testRun.status === 'COMPLETED') {
      return serviceResponse.error(
        new Error(`Test run is already ${testRun.status.toLowerCase()}`)
      );
    }
    
    // Update the test run status to IN_PROGRESS
    const updatedTestRun = await prisma.testRun.update({
      where: { id: runId },
      data: {
        status: 'IN_PROGRESS',
        startTime: new Date()
      }
    });
    
    logger.info(`Test run ${runId} execution started by user ${session.user.id}`);
    
    return serviceResponse.success(updatedTestRun);
  } catch (error) {
    logger.error('Error executing test run:', error);
    return serviceResponse.error(
      error instanceof Error ? new Error(error.message) : new Error('Failed to execute test run')
    );
  }
} 