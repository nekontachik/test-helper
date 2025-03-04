import type { Session } from 'next-auth';
import type { InternalAxiosRequestConfig } from 'axios';

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

export interface QueuedRequest {
  method: string;
  url: string;
  data?: unknown;
  maxRetries: number;
  attempt?: number;
}

export interface CacheEntry {
  data: unknown;
  timestamp: number;
}

export const DEFAULT_CONFIG: RequestConfig = {
  retries: 3,
  cache: true,
  cacheTime: 5 * 60 * 1000, // 5 minutes
  retryDelay: 1000, // 1 second
  offlineEnabled: true
};