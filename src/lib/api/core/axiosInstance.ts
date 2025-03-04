import axios, { type AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { getSession } from 'next-auth/react';
import { requestQueue } from '@/lib/queue/requestQueue';
import { ApiError } from '@/lib/errors/ApiError';
import type { Session } from 'next-auth';

// Define custom types locally if they're not available from the types module
interface CustomSession extends Session {
  accessToken?: string;
  refreshToken?: string;
}

interface CustomConfig extends InternalAxiosRequestConfig {
  skipAuth?: boolean;
  _retry?: boolean;
  offlineEnabled?: boolean;
  retries?: number;
}

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const customConfig = config as CustomConfig;
  // Skip auth if specified
  if (customConfig.skipAuth) return config;

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
        maxRetries: config.retries || 3
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
          return api(config as AxiosRequestConfig);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api; 