import type { InternalAxiosRequestConfig } from 'axios';
import type { Session } from 'next-auth';

export type CustomSession = Session & {
  accessToken?: string;
  refreshToken?: string;
};

export interface CustomConfig extends InternalAxiosRequestConfig {
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

export interface ApiClientInstance {
  request<T>(method: string, url: string, data?: unknown, config?: RequestConfig): Promise<T>;
  get<T>(url: string, params?: unknown, config?: RequestConfig): Promise<T>;
  post<T>(url: string, data: unknown, config?: RequestConfig): Promise<T>;
  put<T>(url: string, data: unknown, config?: RequestConfig): Promise<T>;
  delete<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>;
  clearCache(): void;
  invalidateCache(url: string): void;
}

export interface CacheEntry {
  data: unknown;
  timestamp: number;
} 