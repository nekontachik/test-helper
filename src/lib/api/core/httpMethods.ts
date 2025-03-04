import { request } from './requestHandler';

// Define RequestConfig interface locally if it's not available from the types module
interface RequestConfig {
  retries?: number;
  cache?: boolean;
  cacheTime?: number;
  retryDelay?: number;
  skipAuth?: boolean;
  offlineEnabled?: boolean;
}

/**
 * GET request
 */
export async function get<T>(url: string, params?: unknown, config?: RequestConfig): Promise<T> {
  return request<T>('GET', url, params, config);
}

/**
 * POST request
 */
export async function post<T>(url: string, data: unknown, config?: RequestConfig): Promise<T> {
  return request<T>('POST', url, data, config);
}

/**
 * PUT request
 */
export async function put<T>(url: string, data: unknown, config?: RequestConfig): Promise<T> {
  return request<T>('PUT', url, data, config);
}

/**
 * DELETE request
 */
export async function del<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
  return request<T>('DELETE', url, data, config);
} 