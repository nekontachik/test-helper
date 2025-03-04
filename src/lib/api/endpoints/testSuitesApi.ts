import { get, post, put, del } from '../core/httpMethods';
import { handleApiError } from '../utils/errorHandler';
import type { TestSuite, TestSuiteFormData } from '@/types';

/**
 * Test Suites API endpoints
 */
export const testSuitesApi = {
  /**
   * Get all test suites for a project
   */
  async getTestSuites(projectId: string): Promise<TestSuite[]> {
    try {
      return await get<TestSuite[]>(`/projects/${projectId}/test-suites`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get a single test suite by ID
   */
  async getTestSuite(projectId: string, suiteId: string): Promise<TestSuite> {
    try {
      return await get<TestSuite>(`/projects/${projectId}/test-suites/${suiteId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Create a new test suite
   */
  async createTestSuite(projectId: string, data: TestSuiteFormData): Promise<TestSuite> {
    try {
      return await post<TestSuite>(`/projects/${projectId}/test-suites`, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update an existing test suite
   */
  async updateTestSuite(projectId: string, suiteId: string, data: Partial<TestSuite>): Promise<TestSuite> {
    try {
      return await put<TestSuite>(`/projects/${projectId}/test-suites/${suiteId}`, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete a test suite
   */
  async deleteTestSuite(projectId: string, suiteId: string): Promise<void> {
    try {
      await del(`/projects/${projectId}/test-suites/${suiteId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }
};