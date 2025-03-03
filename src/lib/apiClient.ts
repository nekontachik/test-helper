import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { ApiError } from './errors/ApiError';
import { getSession } from 'next-auth/react';
import { requestQueue } from './queue/requestQueue';
import type { Project, ProjectFormData, TestCase, TestRun, TestReport, PaginatedResponse, TestCaseFormData, TestRunFormData, TestReportFormData, TestCaseStatus, TestCasePriority, TestCaseVersion, TestSuite, TestSuiteFormData, TestCaseResult } from '@/types';

interface CustomConfig extends InternalAxiosRequestConfig {
  skipAuth?: boolean;
  _retry?: boolean;
  offlineEnabled?: boolean;
  retries?: number;
}

export interface RequestConfig {
  retries?: number;
  cache?: boolean;
  cacheTime?: number;
  retryDelay?: number;
  skipAuth?: boolean;
  offlineEnabled?: boolean;
}

const DEFAULT_CONFIG: RequestConfig = {
  retries: 3,
  cache: true,
  cacheTime: 5 * 60 * 1000, // 5 minutes
  retryDelay: 1000, // 1 second
  offlineEnabled: true
};

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>();

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(async (config: CustomConfig) => {
  // Skip auth if specified
  if (config.skipAuth) return config;

  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as CustomConfig;
    
    // Handle offline mode
    if (!navigator.onLine && config.offlineEnabled) {
      requestQueue.enqueue({
        method: config.method?.toUpperCase() || 'GET',
        url: config.url || '',
        data: config.data,
        maxRetries: config.retries || DEFAULT_CONFIG.retries!
      });
      return Promise.reject(new ApiError('OFFLINE', 'Operation queued for offline mode'));
    }

    // Handle 401 and token refresh
    if (error.response?.status === 401 && !config._retry) {
      config._retry = true;
      try {
        // Refresh token logic here
        const session = await getSession();
        if (session?.refreshToken) {
          // Implement your token refresh logic
          return api(config);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

const apiClient = {
  async request<T>(
    method: string,
    url: string,
    data?: unknown,
    config: RequestConfig = DEFAULT_CONFIG
  ): Promise<T> {
    const cacheKey = `${method}:${url}:${JSON.stringify(data)}`;
    
    // Check cache for GET requests
    if (config.cache && method === 'GET') {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < (config.cacheTime || DEFAULT_CONFIG.cacheTime!)) {
        return cached.data as T;
      }
    }

    // Handle offline mode for non-GET requests
    if (!navigator.onLine && config.offlineEnabled && method !== 'GET') {
      requestQueue.enqueue({
        method,
        url,
        data,
        maxRetries: config.retries || DEFAULT_CONFIG.retries!
      });
      throw new ApiError('OFFLINE', 'Operation queued for offline mode');
    }

    let lastError: Error | null = null;
    const maxRetries = config.retries || DEFAULT_CONFIG.retries!;
    const retryDelay = config.retryDelay || DEFAULT_CONFIG.retryDelay!;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await api.request<T>({
          method,
          url,
          ...(method === 'GET' ? { params: data } : { data }),
          skipAuth: config.skipAuth,
          offlineEnabled: config.offlineEnabled,
          retries: config.retries
        } as CustomConfig);

        // Cache successful GET responses
        if (config.cache && method === 'GET') {
          cache.set(cacheKey, {
            data: response.data,
            timestamp: Date.now(),
          });
        }

        return response.data;
      } catch (error) {
        const handledError = this.handleError(error);
        if (handledError instanceof ApiError && handledError.code === 'OFFLINE') {
          throw handledError;
        }
        lastError = handledError;
        if (attempt === maxRetries) break;
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }

    throw lastError || new Error('Request failed');
  },

  handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;

      switch (status) {
        case 400:
          return new ApiError('BAD_REQUEST', data?.message || 'Invalid request');
        case 401:
          return new ApiError('UNAUTHORIZED', 'Authentication required');
        case 403:
          return new ApiError('FORBIDDEN', 'Access denied');
        case 404:
          return new ApiError('NOT_FOUND', 'Resource not found');
        case 429:
          return new ApiError('RATE_LIMIT', 'Too many requests');
        default:
          return new ApiError('INTERNAL_ERROR', 'An unexpected error occurred');
      }
    }
    if (error instanceof ApiError) {
      return error;
    }
    return new Error('An unexpected error occurred');
  },

  async get<T>(url: string, params?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>('GET', url, params, config);
  },

  async post<T>(url: string, data: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>('POST', url, data, config);
  },

  async put<T>(url: string, data: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>('PUT', url, data, config);
  },

  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('DELETE', url, undefined, config);
  },

  clearCache() {
    cache.clear();
  },

  invalidateCache(url: string) {
    for (const key of cache.keys()) {
      if (key.includes(url)) {
        cache.delete(key);
      }
    }
  },

  async getProjects(page = 1, limit = 10): Promise<PaginatedResponse<Project>> {
    try {
      const response = await api.get<PaginatedResponse<Project>>(`/projects`, { params: { page, limit } });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async createProject(data: ProjectFormData): Promise<Project> {
    try {
      const response = await api.post<Project>('/projects', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
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
      throw this.handleError(error);
    }
  },

  async getTestRuns(projectId: string, params: { page: number; limit: number; sort?: string; filter?: string }): Promise<PaginatedResponse<TestRun>> {
    return this.get<PaginatedResponse<TestRun>>(`/projects/${projectId}/test-runs`, params);
  },

  async createTestCase(projectId: string, data: TestCaseFormData): Promise<TestCase> {
    try {
      return this.post<TestCase>(`/projects/${projectId}/test-cases`, data);
    } catch (error) {
      throw this.handleError(error);
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
      throw this.handleError(error);
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
      throw this.handleError(error);
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
