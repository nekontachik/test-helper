import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { getSession } from 'next-auth/react';
import type { Project, ProjectFormData, TestCase, TestRun, TestReport, PaginatedResponse, TestCaseFormData, TestRunFormData, TestReportFormData, TestCaseStatus, TestCasePriority, TestCaseVersion, TestSuite, TestSuiteFormData, TestCaseResult } from '@/types';

// Custom error class for API errors
class ApiError extends Error {
  code: string;
  details?: unknown;
  
  constructor(message: string, public statusCode: number, options?: { code?: string; details?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.code = options?.code ?? 'UNKNOWN_ERROR';
    this.details = options?.details;
  }
}

const config = {
  devMode: process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEV_AUTH === 'true',
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
};

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  devMode?: boolean;
  skipAuth?: boolean;
}

const api: AxiosInstance = axios.create({
  baseURL: config.baseURL,
});

api.interceptors.request.use(async (config: ExtendedAxiosRequestConfig) => {
  if (config.devMode) {
    config.headers.Authorization = `Bearer dev-token`;
    return config;
  }
  
  const session = await getSession();
  if (session?.user) {
    config.headers.Authorization = `Bearer ${session.user.id}`;
  }
  return config;
});

interface ApiErrorResponse {
  message: string;
  code: string;
  details?: unknown;
}

const handleAxiosError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const errorData = error.response?.data as Partial<ApiErrorResponse>;
    throw new ApiError(
      errorData?.message ?? 'Request failed',
      error.response?.status ?? 500,
      {
        code: errorData?.code,
        details: errorData?.details
      }
    );
  }
  throw error;
};

const apiClient = {
  async get<T>(url: string, params?: unknown): Promise<T> {
    try {
      const response = await api.get<T>(url, { params });
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async post<T>(url: string, data: unknown): Promise<T> {
    try {
      const response = await api.post<T>(url, data);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async put<T>(url: string, data: unknown): Promise<T> {
    try {
      const response = await api.put<T>(url, data);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async delete(url: string): Promise<void> {
    await api.delete(url);
  },

  async getProjects(page = 1, limit = 10): Promise<PaginatedResponse<Project>> {
    try {
      const response = await api.get<PaginatedResponse<Project>>(`/projects`, { params: { page, limit } });
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async createProject(data: ProjectFormData): Promise<Project> {
    try {
      const response = await api.post<Project>('/projects', data);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
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
    try {
      return this.get<PaginatedResponse<TestCase>>(`/projects/${projectId}/test-cases`, params);
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async getTestRuns(projectId: string, params: { page: number; limit: number; sort?: string; filter?: string }): Promise<PaginatedResponse<TestRun>> {
    return this.get<PaginatedResponse<TestRun>>(`/projects/${projectId}/test-runs`, params);
  },

  async createTestCase(projectId: string, data: TestCaseFormData): Promise<TestCase> {
    try {
      return this.post<TestCase>(`/projects/${projectId}/test-cases`, data);
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async getTestReports(projectId: string): Promise<TestReport[]> {
    return this.get<TestReport[]>(`/projects/${projectId}/test-reports`);
  },

  async getTestCaseVersions(projectId: string, testCaseId: string): Promise<TestCaseVersion[]> {
    try {
      const response = await api.get(`/projects/${projectId}/test-cases/${testCaseId}/versions`);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async getTestCaseVersion(projectId: string, testCaseId: string, version: number): Promise<TestCase> {
    return this.get<TestCase>(`/projects/${projectId}/test-cases/${testCaseId}/versions/${version}`);
  },

  async createTestRun(projectId: string, data: TestRunFormData): Promise<TestRun> {
    return this.post<TestRun>(`/projects/${projectId}/test-runs`, data);
  },

  async updateTestRun(projectId: string, runId: string, data: Partial<TestRun>): Promise<TestRun> {
    return this.put<TestRun>(`/projects/${projectId}/test-runs/${runId}`, data);
  },

  async createTestReport(projectId: string, data: TestReportFormData): Promise<TestReport> {
    return this.post<TestReport>(`/projects/${projectId}/test-reports`, data);
  },

  async getTestCase(projectId: string, testCaseId: string): Promise<TestCase> {
    return this.get<TestCase>(`/projects/${projectId}/test-cases/${testCaseId}`);
  },

  async updateTestCase(projectId: string, testCaseId: string, data: Partial<TestCaseFormData>): Promise<TestCase> {
    return this.put<TestCase>(`/projects/${projectId}/test-cases/${testCaseId}`, data);
  },

  async deleteTestCase(projectId: string, testCaseId: string): Promise<void> {
    return this.delete(`/projects/${projectId}/test-cases/${testCaseId}`);
  },

  async restoreTestCaseVersion(projectId: string, testCaseId: string, versionNumber: number): Promise<TestCase> {
    try {
      return this.post<TestCase>(`/projects/${projectId}/test-cases/${testCaseId}/restore`, { versionNumber });
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async register(data: { name: string; email: string; password: string; role: string }): Promise<void> {
    const response = await api.post('/auth/register', data);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Registration failed');
    }
  },

  async getProject(projectId: string): Promise<Project> {
    return this.get<Project>(`/projects/${projectId}`);
  },

  async getTestRun(projectId: string, runId: string): Promise<TestRun> {
    return this.get<TestRun>(`/projects/${projectId}/test-runs/${runId}`);
  },

  async deleteTestRun(projectId: string, runId: string): Promise<void> {
    return this.delete(`/projects/${projectId}/test-runs/${runId}`);
  },

  async getTestSuite(projectId: string, suiteId: string): Promise<TestSuite> {
    return this.get<TestSuite>(`/projects/${projectId}/test-suites/${suiteId}`);
  },

  async updateTestSuite(projectId: string, suiteId: string, data: Partial<TestSuite>): Promise<TestSuite> {
    return this.put<TestSuite>(`/projects/${projectId}/test-suites/${suiteId}`, data);
  },

  async getTestSuites(projectId: string): Promise<TestSuite[]> {
    return this.get<TestSuite[]>(`/projects/${projectId}/test-suites`);
  },

  async createTestSuite(projectId: string, data: TestSuiteFormData): Promise<TestSuite> {
    return this.post<TestSuite>(`/projects/${projectId}/test-suites`, data);
  },

  async getTestCaseResults(projectId: string, runId: string): Promise<TestCaseResult[]> {
    return this.get<TestCaseResult[]>(`/projects/${projectId}/test-runs/${runId}/results`);
  },

  // Add other methods as needed
};

export default apiClient;
