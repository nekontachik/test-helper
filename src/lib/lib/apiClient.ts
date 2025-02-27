import axios from 'axios';
import type { TestCase, TestRun, PaginatedResponse } from '@/types';

const api = axios.create({
  baseURL: '/api',
});

export const apiClient = {
  // ... existing methods

  async getTestCases(projectId: string): Promise<PaginatedResponse<TestCase>> {
    const response = await api.get<PaginatedResponse<TestCase>>(
      `/projects/${projectId}/test-cases`
    );
    return response.data;
  },

  async getTestRuns(projectId: string): Promise<PaginatedResponse<TestRun>> {
    const response = await api.get<PaginatedResponse<TestRun>>(
      `/projects/${projectId}/test-runs`
    );
    return response.data;
  },

  // ... other methods
};
