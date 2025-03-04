import { get, post, put, del } from '../core/httpMethods';
import { handleApiError } from '../utils/errorHandler';
import type { 
  TestCase, 
  TestCaseFormData, 
  TestCaseStatus, 
  TestCasePriority, 
  TestCaseVersion,
  PaginatedResponse 
} from '@/types';

/**
 * Test Cases API endpoints
 */
export const testCasesApi = {
  /**
   * Get test cases with filtering and pagination
   */
  async getTestCases(
    projectId: string,
    params: {
      page: number;
      limit: number;
      status?: TestCaseStatus | null;
      priority?: TestCasePriority | null;
      search?: string;
    }
  ): Promise<PaginatedResponse<TestCase>> {
    try {
      return await get<PaginatedResponse<TestCase>>(`/projects/${projectId}/test-cases`, params);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get a single test case by ID
   */
  async getTestCase(projectId: string, testCaseId: string): Promise<TestCase> {
    try {
      return await get<TestCase>(`/projects/${projectId}/test-cases/${testCaseId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Create a new test case
   */
  async createTestCase(projectId: string, data: TestCaseFormData): Promise<TestCase> {
    try {
      return await post<TestCase>(`/projects/${projectId}/test-cases`, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update an existing test case
   */
  async updateTestCase(projectId: string, testCaseId: string, data: Partial<TestCaseFormData>): Promise<TestCase> {
    try {
      return await put<TestCase>(`/projects/${projectId}/test-cases/${testCaseId}`, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete a test case
   */
  async deleteTestCase(projectId: string, testCaseId: string): Promise<void> {
    try {
      await del(`/projects/${projectId}/test-cases/${testCaseId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get all versions of a test case
   */
  async getTestCaseVersions(projectId: string, testCaseId: string): Promise<TestCaseVersion[]> {
    try {
      return await get<TestCaseVersion[]>(`/projects/${projectId}/test-cases/${testCaseId}/versions`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get a specific version of a test case
   */
  async getTestCaseVersion(projectId: string, testCaseId: string, version: number): Promise<TestCase> {
    try {
      return await get<TestCase>(`/projects/${projectId}/test-cases/${testCaseId}/versions/${version}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Restore a test case to a previous version
   */
  async restoreTestCaseVersion(projectId: string, testCaseId: string, versionNumber: number): Promise<TestCase> {
    try {
      return await post<TestCase>(`/projects/${projectId}/test-cases/${testCaseId}/restore`, { versionNumber });
    } catch (error) {
      throw handleApiError(error);
    }
  }
}; 