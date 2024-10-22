import { getSession } from 'next-auth/react';
import { TestCaseStatus, TestCasePriority, TestCase, TestRun, PaginatedResponse } from '@/types';

const apiClient = {
  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const session = await getSession();
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    const response = await fetch(`${url}${queryString}`, {
      headers: {
        'Authorization': session ? `Bearer ${session.user.email}` : '',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async put<T>(url: string, data: any): Promise<T> {
    const session = await getSession();
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': session ? `Bearer ${session.user.email}` : '',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Add other methods (post, delete) as needed

  async getTestCases(projectId: string, params: {
    page: number;
    limit: number;
    status?: TestCaseStatus | null;
    priority?: TestCasePriority | null;
    search?: string;
  }): Promise<PaginatedResponse<TestCase>> {
    return this.get<PaginatedResponse<TestCase>>(`/api/projects/${projectId}/test-cases`, params);
  },

  async getTestRuns(projectId: string, params: {
    page: number;
    limit: number;
    sort?: string;
    filter?: string;
  }): Promise<PaginatedResponse<TestRun>> {
    return this.get<PaginatedResponse<TestRun>>(`/api/projects/${projectId}/test-runs`, params);
  }
};

export default apiClient;
