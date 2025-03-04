import type { TestCase, TestCaseFormData, TestCaseStatus, TestCasePriority, TestCaseVersion, PaginatedResponse } from '../../../types';
import type { TestCasesApiClient } from './types';
import apiClient from '../core/apiClient';

const testCasesApi: TestCasesApiClient = {
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
    return apiClient.get<PaginatedResponse<TestCase>>(`/projects/${projectId}/test-cases`, params);
  },

  async getTestCase(projectId: string, testCaseId: string): Promise<TestCase> {
    return apiClient.get<TestCase>(`/projects/${projectId}/test-cases/${testCaseId}`);
  },

  async createTestCase(projectId: string, data: TestCaseFormData): Promise<TestCase> {
    return apiClient.post<TestCase>(`/projects/${projectId}/test-cases`, data);
  },

  async updateTestCase(projectId: string, testCaseId: string, data: Partial<TestCaseFormData>): Promise<TestCase> {
    return apiClient.put<TestCase>(`/projects/${projectId}/test-cases/${testCaseId}`, data);
  },

  async deleteTestCase(projectId: string, testCaseId: string): Promise<void> {
    return apiClient.delete(`/projects/${projectId}/test-cases/${testCaseId}`);
  },

  async getTestCaseVersions(projectId: string, testCaseId: string): Promise<TestCaseVersion[]> {
    return apiClient.get<TestCaseVersion[]>(`/projects/${projectId}/test-cases/${testCaseId}/versions`);
  },

  async getTestCaseVersion(projectId: string, testCaseId: string, version: number): Promise<TestCase> {
    return apiClient.get<TestCase>(`/projects/${projectId}/test-cases/${testCaseId}/versions/${version}`);
  },

  async restoreTestCaseVersion(projectId: string, testCaseId: string, versionNumber: number): Promise<TestCase> {
    return apiClient.post<TestCase>(`/projects/${projectId}/test-cases/${testCaseId}/restore`, { versionNumber });
  },
};

export default testCasesApi; 