import { getSession } from 'next-auth/react';
import type { TestCaseStatus, TestCasePriority, TestCase, TestRun, PaginatedResponse } from '@/types';
import { AppError, ApiError } from '@/lib/errors';

interface RequestConfig {
  retries?: number;
  cache?: boolean;
  cacheTime?: number;
  retryDelay?: number;
}

const DEFAULT_CONFIG: RequestConfig = {
  retries: 3,
  cache: true,
  cacheTime: 5 * 60 * 1000, // 5 minutes
  retryDelay: 1000, // 1 second
};

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

const apiClient = {
  async request<T>(
    method: string,
    url: string,
    data?: any,
    config: RequestConfig = DEFAULT_CONFIG
  ): Promise<T> {
    const cacheKey = `${method}:${url}:${JSON.stringify(data)}`;
    
    // Check cache
    if (config.cache && method === 'GET') {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < (config.cacheTime || DEFAULT_CONFIG.cacheTime!)) {
        return cached.data;
      }
    }

    let lastError: Error | null = null;
    const maxRetries = config.retries || DEFAULT_CONFIG.retries!;
    const retryDelay = config.retryDelay || DEFAULT_CONFIG.retryDelay!;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const session = await getSession();
        const response = await fetch(url, {
          method,
          headers: {
            ...(data ? { 'Content-Type': 'application/json' } : {}),
            'Authorization': session?.user?.email ? `Bearer ${session.user.email}` : '',
          },
          ...(data ? { body: JSON.stringify(data) } : {}),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new ApiError(
            errorData.message || 'Request failed',
            errorData.code || 'UNKNOWN_ERROR',
            response.status
          );
        }

        const responseData = await response.json();

        // Cache successful GET requests
        if (config.cache && method === 'GET') {
          cache.set(cacheKey, {
            data: responseData,
            timestamp: Date.now(),
          });
        }

        return responseData;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (error instanceof ApiError) {
          if ([401, 403, 404].includes(error.statusCode)) {
            throw error;
          }
        }

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
          continue;
        }
        break;
      }
    }

    throw lastError || new Error('Request failed');
  },

  async get<T>(url: string, params?: Record<string, any>, config?: RequestConfig): Promise<T> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<T>('GET', `${url}${queryString}`, undefined, config);
  },

  async post<T>(url: string, data: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('POST', url, data, config);
  },

  async put<T>(url: string, data: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('PUT', url, data, config);
  },

  async delete(url: string, config?: RequestConfig): Promise<void> {
    return this.request('DELETE', url, undefined, config);
  },

  async getTestCases(
    projectId: string,
    params: {
      page: number;
      limit: number;
      status?: TestCaseStatus | null;
      priority?: TestCasePriority | null;
      search?: string;
    },
    config?: RequestConfig
  ): Promise<PaginatedResponse<TestCase>> {
    return this.get<PaginatedResponse<TestCase>>(
      `/api/projects/${projectId}/test-cases`,
      params,
      config
    );
  },

  async getTestRuns(
    projectId: string,
    params: {
      page: number;
      limit: number;
      sort?: string;
      filter?: string;
    },
    config?: RequestConfig
  ): Promise<PaginatedResponse<TestRun>> {
    return this.get<PaginatedResponse<TestRun>>(
      `/api/projects/${projectId}/test-runs`,
      params,
      config
    );
  },

  clearCache() {
    cache.clear();
  },

  invalidateCache(pattern: RegExp) {
    // Convert Map keys iterator to array before iterating
    Array.from(cache.keys()).forEach(key => {
      if (pattern.test(key)) {
        cache.delete(key);
      }
    });
  }
};

export default apiClient;
