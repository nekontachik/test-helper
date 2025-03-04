import { get, post, put, del } from '../core/httpMethods';
import { handleApiError } from '../utils/errorHandler';
import type { TestRun, TestRunFormData, TestCaseResult, PaginatedResponse } from '@/types';

/**
 * Test Runs API endpoints
 */
export const testRunsApi = {
  /**
   * Get test runs with filtering and pagination
   */
  async getTestRuns(
    projectId: string, 
    params: { 
      page: number; 
      limit: number; 
      sort?: string; 
      filter?: string 
    }
  ): Promise<PaginatedResponse<TestRun>> {
    try {
      return await get<PaginatedResponse<TestRun>>(`/projects/${projectId}/test-runs`, params);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get a single test run by ID
   */
  async getTestRun(projectId: string, runId: string): Promise<TestRun> {
    try {
      return await get<TestRun>(`/projects/${projectId}/test-runs/${runId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Create a new test run
   */
  async createTestRun(projectId: string, data: TestRunFormData): Promise<TestRun> {
    try {
      return await post<TestRun>(`/projects/${projectId}/test-runs`, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update a test run (e.g., update status, test case results)
   */
  async updateTestRun(
    projectId: string, 
    runId: string, 
    data: { 
      status: string; 
      testCaseResults: unknown[] 
    }
  ): Promise<void> {
    try {
      await put<void>(`/projects/${projectId}/test-runs/${runId}`, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete a test run
   */
  async deleteTestRun(projectId: string, runId: string): Promise<void> {
    try {
      await del(`/projects/${projectId}/test-runs/${runId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete multiple test runs at once
   */
  async bulkDeleteTestRuns(projectId: string, runIds: string[]): Promise<void> {
    try {
      await del(`/projects/${projectId}/test-runs/bulk`, { runIds });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get test case results for a specific test run
   */
  async getTestCaseResults(projectId: string, runId: string): Promise<TestCaseResult[]> {
    try {
      return await get<TestCaseResult[]>(`/projects/${projectId}/test-runs/${runId}/results`);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}; 