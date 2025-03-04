import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { getSession } from 'next-auth/react';
import { requestQueue } from '../../queue/requestQueue';
import { ApiError } from '../../errors/ApiError';
import type { CustomConfig, RequestConfig, ApiClientInstance, CustomSession, CacheEntry } from './types';

const DEFAULT_CONFIG: RequestConfig = {
  retries: 3,
  cache: true,
  cacheTime: 5 * 60 * 1000, // 5 minutes
  retryDelay: 1000, // 1 second
  offlineEnabled: true
};

// Simple in-memory cache
const cache = new Map<string, CacheEntry>();

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(async (config: CustomConfig) => {
  // Skip auth if specified
  if (config.skipAuth) return config;

  const session = await getSession() as CustomSession;
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
        const session = await getSession() as CustomSession;
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

const handleError = (error: unknown): Error => {
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
};

const apiClient: ApiClientInstance = {
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
        lastError = handleError(error);
        if (lastError instanceof ApiError && lastError.code === 'OFFLINE') {
          throw lastError;
        }
        if (attempt === maxRetries) break;
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }

    throw lastError || new Error('Request failed');
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

  async delete<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>('DELETE', url, data, config);
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
};

export default apiClient; 