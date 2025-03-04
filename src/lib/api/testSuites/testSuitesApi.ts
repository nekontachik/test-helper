import type { TestSuite, TestSuiteFormData } from '../../../types';
import type { TestSuitesApiClient } from './types';
import apiClient from '../core/apiClient';

const testSuitesApi: TestSuitesApiClient = {
  async getTestSuites(projectId: string): Promise<TestSuite[]> {
    return apiClient.get<TestSuite[]>(`/projects/${projectId}/test-suites`);
  },

  async getTestSuite(projectId: string, suiteId: string): Promise<TestSuite> {
    return apiClient.get<TestSuite>(`/projects/${projectId}/test-suites/${suiteId}`);
  },

  async createTestSuite(projectId: string, data: TestSuiteFormData): Promise<TestSuite> {
    return apiClient.post<TestSuite>(`/projects/${projectId}/test-suites`, data);
  },

  async updateTestSuite(projectId: string, suiteId: string, data: Partial<TestSuite>): Promise<TestSuite> {
    return apiClient.put<TestSuite>(`/projects/${projectId}/test-suites/${suiteId}`, data);
  },
};

export default testSuitesApi; 