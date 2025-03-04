import api from './axiosInstance';
import { cacheUtils } from '../utils/cache';
import { handleApiError } from '../utils/errorHandler';
import { requestQueue } from '@/lib/queue/requestQueue';
import { ApiError } from '@/lib/errors/ApiError';
import type { CustomConfig } from '../types';

// Define RequestConfig interface locally if it's not available from the types module
interface RequestConfig {
  retries?: number;
  cache?: boolean;
  cacheTime?: number;
  retryDelay?: number;
  skipAuth?: boolean;
  offlineEnabled?: boolean;
}

// Default configuration
const DEFAULT_CONFIG: RequestConfig = {
  retries: 3,
  cache: true,
  cacheTime: 5 * 60 * 1000, // 5 minutes
  retryDelay: 1000, // 1 second
  offlineEnabled: true
};

/**
 * Core request function that handles caching, retries, and offline mode
 */
export async function request<T>(
  method: string,
  url: string,
  data?: unknown,
  config: RequestConfig = DEFAULT_CONFIG
): Promise<T> {
  const cacheKey = cacheUtils.generateKey(method, url, data);
  
  // Check cache for GET requests
  if (config.cache && method === 'GET') {
    const cached = cacheUtils.get<T>(cacheKey);
    if (cached && cacheUtils.has(cacheKey, config.cacheTime || DEFAULT_CONFIG.cacheTime!)) {
      return cached;
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
        cacheUtils.set(cacheKey, response.data);
      }

      return response.data;
    } catch (error) {
      const handledError = handleApiError(error);
      if (handledError instanceof ApiError && handledError.code === 'OFFLINE') {
        throw handledError;
      }
      
      lastError = handledError;
      if (attempt === maxRetries) break;
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
    }
  }

  throw lastError || new Error('Request failed');
} 