import type { TestReport, TestReportFormData } from '../../../types';
import type { TestReportsApiClient } from './types';
import apiClient from '../core/apiClient';

const testReportsApi: TestReportsApiClient = {
  async getTestReports(projectId: string): Promise<TestReport[]> {
    return apiClient.get<TestReport[]>(`/projects/${projectId}/test-reports`);
  },

  async createTestReport(projectId: string, data: TestReportFormData): Promise<TestReport> {
    return apiClient.post<TestReport>(`/projects/${projectId}/test-reports`, data);
  },
};

export default testReportsApi; 