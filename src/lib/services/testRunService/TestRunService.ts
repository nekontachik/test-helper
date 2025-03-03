import type { TestRun } from '@prisma/client';
import { TestRunStatus } from '@/types/testRun';
import type { TestRunSummary } from '@/types/testRun';
import { logger } from '@/lib/logger';
import { testRunCache } from '@/lib/cache/testRunCache';
import { ErrorFactory } from '@/lib/errors/BaseError';
import { countResultsByStatus } from './utils';
import * as queries from './queries';

/**
 * Service class for test run operations
 */
export class TestRunService {
  /**
   * Create a new test run
   */
  static async create(data: {
    name: string;
    description?: string;
    projectId: string;
    testCaseIds: string[];
    userId: string;
  }): Promise<TestRun> {
    try {
      // Validate project exists
      const project = await queries.findProjectById(data.projectId);
      
      if (!project) {
        throw ErrorFactory.create('NOT_FOUND', 'Project not found');
      }
      
      // Validate test cases exist and belong to the project
      const testCases = await queries.findTestCasesByIds(data.testCaseIds, data.projectId);
      
      if (testCases.length !== data.testCaseIds.length) {
        throw ErrorFactory.create('VALIDATION_ERROR', 'One or more test cases are invalid or do not belong to this project');
      }
      
      // Create test run
      const testRun = await queries.createTestRun({
        name: data.name,
        description: data.description,
        status: TestRunStatus.PENDING,
        projectId: data.projectId,
        createdById: data.userId,
        testCaseIds: data.testCaseIds
      });
      
      // Invalidate project test runs cache
      await testRunCache.invalidateProjectTestRuns(data.projectId);
      
      return testRun;
    } catch (error) {
      logger.error('Error creating test run:', error);
      throw error;
    }
  }
  
  /**
   * Get a test run by ID
   */
  static async getById(runId: string): Promise<TestRun> {
    try {
      // Try to get from cache first
      const cachedTestRun = await testRunCache.getTestRun(runId);
      if (cachedTestRun) {
        return cachedTestRun;
      }
      
      // If not in cache, get from database
      const testRun = await queries.findTestRunById(runId);
      
      if (!testRun) {
        throw ErrorFactory.create('NOT_FOUND', 'Test run not found');
      }
      
      // Cache the result
      await testRunCache.setTestRun(testRun as unknown as TestRun);
      
      return testRun as unknown as TestRun;
    } catch (error) {
      logger.error('Error getting test run:', error);
      throw error;
    }
  }
  
  /**
   * Get test runs for a project with pagination
   */
  static async getByProject(
    projectId: string, 
    page = 1, 
    limit = 10
  ): Promise<{ testRuns: TestRun[]; total: number }> {
    try {
      // Try to get from cache if first page with default limit
      if (page === 1 && limit === 10) {
        const cachedTestRuns = await testRunCache.getProjectTestRuns(projectId);
        if (cachedTestRuns) {
          const total = await queries.findTestRunsByProject(projectId, 1, 0).then(r => r.total);
          return { testRuns: cachedTestRuns, total };
        }
      }
      
      // Get test runs with pagination
      const { testRuns, total } = await queries.findTestRunsByProject(projectId, page, limit);
      
      // Cache first page results
      if (page === 1 && limit === 10) {
        await testRunCache.setProjectTestRuns(projectId, testRuns);
      }
      
      return { testRuns, total };
    } catch (error) {
      logger.error('Error getting test runs for project:', error);
      throw error;
    }
  }
  
  /**
   * Get test run summary
   */
  static async getSummary(runId: string): Promise<TestRunSummary> {
    try {
      // Try to get from cache first
      const cachedSummary = await testRunCache.getTestRunSummary(runId);
      if (cachedSummary) {
        return cachedSummary;
      }
      
      const testRun = await queries.findTestRunById(runId);
      
      if (!testRun) {
        throw ErrorFactory.create('NOT_FOUND', 'Test run not found');
      }
      
      // Calculate summary
      const total = testRun.testRunCases.length;
      const resultsByStatus = countResultsByStatus(
        testRun.testResults.map(r => ({ status: r.status }))
      );
      
      const passed = resultsByStatus.PASSED || 0;
      const failed = resultsByStatus.FAILED || 0;
      const skipped = resultsByStatus.SKIPPED || 0;
      const blocked = resultsByStatus.BLOCKED || 0;
      const notExecuted = total - (passed + failed + skipped + blocked);
      
      const passRate = total > 0 ? (passed / total) * 100 : 0;
      const completionRate = total > 0 ? ((passed + failed + skipped + blocked) / total) * 100 : 0;
      
      const summary: TestRunSummary = {
        total,
        passed,
        failed,
        skipped,
        blocked,
        notExecuted,
        passRate,
        completionRate
      };
      
      // Cache the summary
      await testRunCache.setTestRunSummary(runId, summary);
      
      return summary;
    } catch (error) {
      logger.error('Error getting test run summary:', error);
      throw error;
    }
  }
} 