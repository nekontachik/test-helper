import axios, { AxiosInstance } from 'axios';
import { getSession } from 'next-auth/react';
import { Project, ProjectFormData, TestCase, TestRun, TestReport, PaginatedResponse, TestCaseFormData, TestRunFormData, TestReportFormData, TestCaseStatus, TestCasePriority, TestCaseVersion, TestSuite, TestSuiteFormData } from '@/types';

const api: AxiosInstance = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.user) {
    config.headers.Authorization = `Bearer ${session.user.id}`;
  }
  return config;
});

const apiClient = {
  async createProject(data: ProjectFormData): Promise<Project> {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },

  async getProjects(): Promise<PaginatedResponse<Project>> {
    const response = await api.get<PaginatedResponse<Project>>('/projects');
    return response.data;
  },

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
    const response = await api.get<PaginatedResponse<TestCase>>(`/projects/${projectId}/test-cases`, { 
      params: {
        ...params,
        status: params.status || undefined,
        priority: params.priority || undefined,
      }
    });
    return response.data;
  },

  async getTestRuns(projectId: string, params: { page: number; limit: number; sort?: string; filter?: string }): Promise<PaginatedResponse<TestRun>> {
    const response = await api.get<PaginatedResponse<TestRun>>(`/projects/${projectId}/test-runs`, { params });
    return response.data;
  },

  async createTestCase(projectId: string, data: TestCaseFormData): Promise<TestCase> {
    const response = await api.post<TestCase>(`/api/projects/${projectId}/test-cases`, data);
    return response.data;
  },

  async getTestReports(projectId: string): Promise<TestReport[]> {
    const response = await api.get<TestReport[]>(`/projects/${projectId}/test-reports`);
    return response.data;
  },

  async getTestCaseVersions(projectId: string, testCaseId: string): Promise<TestCaseVersion[]> {
    const response = await api.get<TestCaseVersion[]>(`/projects/${projectId}/test-cases/${testCaseId}/versions`);
    return response.data;
  },

  async getTestCaseVersion(projectId: string, testCaseId: string, version: number): Promise<TestCase> {
    const response = await api.get<TestCase>(`/projects/${projectId}/test-cases/${testCaseId}/versions/${version}`);
    return response.data;
  },

  async createTestRun(projectId: string, data: TestRunFormData): Promise<TestRun> {
    const response = await api.post<TestRun>(`/projects/${projectId}/test-runs`, data);
    return response.data;
  },

  async updateTestRun(projectId: string, testRunId: string, data: Partial<TestRun>): Promise<TestRun> {
    const response = await api.put<TestRun>(`/projects/${projectId}/test-runs/${testRunId}`, data);
    return response.data;
  },

  async createTestReport(projectId: string, data: TestReportFormData): Promise<TestReport> {
    const response = await api.post<TestReport>(`/projects/${projectId}/test-reports`, data);
    return response.data;
  },

  async getTestCase(projectId: string, testCaseId: string): Promise<TestCase> {
    const response = await api.get<TestCase>(`/projects/${projectId}/test-cases/${testCaseId}`);
    return response.data;
  },

  async updateTestCase(projectId: string, testCaseId: string, data: Partial<TestCaseFormData>): Promise<TestCase> {
    const response = await api.put<TestCase>(`/api/projects/${projectId}/test-cases/${testCaseId}`, data);
    return response.data;
  },

  async deleteTestCase(projectId: string, testCaseId: string): Promise<void> {
    await api.delete(`/api/projects/${projectId}/test-cases/${testCaseId}`);
  },

  async restoreTestCaseVersion(projectId: string, testCaseId: string, versionNumber: number): Promise<TestCase> {
    const response = await api.post<TestCase>(`/projects/${projectId}/test-cases/${testCaseId}/restore`, { versionNumber });
    return response.data;
  },

  async register(data: { name: string; email: string; password: string }): Promise<void> {
    await api.post('/auth/register', data);
  },

  async put<T>(url: string, data: any): Promise<T> {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async getProject(projectId: string): Promise<Project> {
    const response = await api.get<Project>(`/projects/${projectId}`);
    return response.data;
  },

  async getTestRun(projectId: string, testRunId: string): Promise<TestRun> {
    const response = await api.get<TestRun>(`/projects/${projectId}/test-runs/${testRunId}`);
    return response.data;
  },

  async deleteTestRun(projectId: string, testRunId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/test-runs/${testRunId}`);
  },

  async getTestSuite(projectId: string, suiteId: string): Promise<TestSuite> {
    const response = await api.get<TestSuite>(`/projects/${projectId}/test-suites/${suiteId}`);
    return response.data;
  },

  async updateTestSuite(projectId: string, suiteId: string, data: Partial<TestSuite>): Promise<TestSuite> {
    const response = await api.put<TestSuite>(`/projects/${projectId}/test-suites/${suiteId}`, data);
    return response.data;
  },

  async getTestSuites(projectId: string): Promise<TestSuite[]> {
    const response = await api.get<TestSuite[]>(`/projects/${projectId}/test-suites`);
    return response.data;
  },

  async createTestSuite(projectId: string, data: TestSuiteFormData): Promise<TestSuite> {
    const response = await api.post<TestSuite>(`/projects/${projectId}/test-suites`, data);
    return response.data;
  },

  // Add other methods as needed
};

export default apiClient;
