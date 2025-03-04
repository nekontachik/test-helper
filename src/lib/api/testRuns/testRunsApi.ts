import type { TestRun, TestRunFormData, PaginatedResponse } from '../../../types';
import type { TestRunsApiClient } from './types';
import apiClient from '../core/apiClient';

const testRunsApi: TestRunsApiClient = {
  async getTestRuns(projectId: string, params: { page: number; limit: number; sort?: string; filter?: string }): Promise<PaginatedResponse<TestRun>> {
    return apiClient.get<PaginatedResponse<TestRun>>(`/projects/${projectId}/test-runs`, params);
  },

  async getTestRun(projectId: string, runId: string): Promise<TestRun> {
    return apiClient.get<TestRun>(`/projects/${projectId}/test-runs/${runId}`);
  },

  async createTestRun(projectId: string, data: TestRunFormData): Promise<TestRun> {
    return apiClient.post<TestRun>(`/projects/${projectId}/test-runs`, data);
  },

  async updateTestRun(projectId: string, runId: string, data: { status: string; testCaseResults: unknown[] }): Promise<void> {
    return apiClient.put(`/projects/${projectId}/test-runs/${runId}`, data);
  },

  async deleteTestRun(projectId: string, runId: string): Promise<void> {
    return apiClient.delete(`/projects/${projectId}/test-runs/${runId}`);
  },

  async bulkDeleteTestRuns(projectId: string, runIds: string[]): Promise<void> {
    return apiClient.delete(`/projects/${projectId}/test-runs/bulk`, { runIds });
  },
};

export default testRunsApi; 