import type { TestRun } from '@prisma/client';
import { serviceResponse, type ServiceResponse } from '@/lib/utils/serviceResponse';
import { authUtils } from '@/lib/utils/authUtils';
import type { TestRunWithCases } from '@/lib/types/testRun';
import { logger } from '@/lib/logger';
import * as queries from './queries';
import { mapToTestRunWithCases, calculateTestRunSummary } from './testRunMappers';

/**
 * Get detailed information about a test run
 */
export async function getTestRunDetails(runId: string): Promise<ServiceResponse<TestRunWithCases>> {
  try {
    await authUtils.requireAuth();
    
    const testRun = await queries.findTestRunById(runId);
    
    if (!testRun) {
      return serviceResponse.error(
        new Error('Test run not found')
      );
    }
    
    const transformedTestRun = mapToTestRunWithCases(testRun);
    
    return serviceResponse.success(transformedTestRun);
  } catch (error) {
    logger.error('Error getting test run details:', error);
    return serviceResponse.error(
      error instanceof Error ? new Error(error.message) : new Error('Failed to get test run details')
    );
  }
}

/**
 * Get test runs by project with pagination
 */
export async function getTestRunsByProject(
  projectId: string,
  page = 1,
  limit = 10
): Promise<ServiceResponse<{ testRuns: TestRun[]; total: number }>> {
  try {
    await authUtils.requireAuth();
    
    const result = await queries.findTestRunsByProject(projectId, page, limit);
    return serviceResponse.success(result);
  } catch (error) {
    logger.error('Error getting test runs by project:', error);
    return serviceResponse.error(
      error instanceof Error ? new Error(error.message) : new Error('Failed to get test runs')
    );
  }
}

/**
 * Get test run summary
 */
export async function getTestRunSummary(
  runId: string
): Promise<ServiceResponse<{
  status: string;
  total: number;
  passed: number;
  failed: number;
  pending: number;
  skipped: number;
}>> {
  try {
    await authUtils.requireAuth();
    
    const testRun = await queries.findTestRunById(runId);
    
    if (!testRun) {
      return serviceResponse.error(
        new Error('Test run not found')
      );
    }
    
    const summary = calculateTestRunSummary(testRun);
    
    return serviceResponse.success(summary);
  } catch (error) {
    logger.error('Error getting test run summary:', error);
    return serviceResponse.error(
      error instanceof Error ? new Error(error.message) : new Error('Failed to get test run summary')
    );
  }
} 