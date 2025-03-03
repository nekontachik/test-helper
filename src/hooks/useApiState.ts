import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import apiClient from '@/lib/apiClient';
import type { ApiError } from '@/lib/errors/ApiError';

interface UseApiStateOptions<T> {
  initialData?: T;
  cacheKey?: string;
  onSuccess?: (data: T) => void;
  onError?: (error: Error | ApiError) => void;
  optimisticUpdate?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface UseApiStateReturn<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | ApiError | null;
  request: <R>(method: string, url: string, requestData?: unknown, optimisticData?: T) => Promise<R>;
  invalidateCache: (key?: string) => void;
  setData: (data: T | undefined) => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const apiCache = new Map<string, CacheEntry<unknown>>();

export function useApiState<T>(options: UseApiStateOptions<T> = {}): UseApiStateReturn<T> {
  const [data, setData] = useState<T | undefined>(options.initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | ApiError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const toast = useToast();

  // Cache management
  const getCachedData = useCallback((key: string): T | undefined => {
    const cached = apiCache.get(key) as CacheEntry<T> | undefined;
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }
    return undefined;
  }, []);

  const setCachedData = useCallback((key: string, data: T) => {
    apiCache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION
    });
  }, []);

  // Request handling
  const request = useCallback(async <R>(
    method: string,
    url: string,
    requestData?: unknown,
    optimisticData?: T
  ): Promise<R> => {
    const cacheKey = options.cacheKey || `${method}:${url}:${JSON.stringify(requestData)}`;
    
    try {
      setError(null);
      setLoading(true);

      // Handle optimistic updates
      if (options.optimisticUpdate && optimisticData) {
        setData(optimisticData);
      }

      // Check cache for GET requests
      if (method === 'GET' && options.cacheKey) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return cachedData as R;
        }
      }

      // Create abort controller
      abortControllerRef.current = new AbortController();

      const response = await apiClient.request<R>(method, url, requestData, {
        cache: true,
        retries: 3,
        skipAuth: false
      });

      // Cache successful GET responses
      if (method === 'GET' && options.cacheKey) {
        setCachedData(cacheKey, response as unknown as T);
      }

      setData(response as unknown as T);
      options.onSuccess?.(response as unknown as T);
      return response;
    } catch (err) {
      const error = err as Error | ApiError;
      setError(error);
      options.onError?.(error);

      // Show error toast
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      throw error;
    } finally {
      setLoading(false);
    }
  }, [options, getCachedData, setCachedData, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const invalidateCache = useCallback((key?: string) => {
    if (key) {
      apiCache.delete(key);
    } else if (options.cacheKey) {
      apiCache.delete(options.cacheKey);
    }
  }, [options.cacheKey]);

  return {
    data,
    loading,
    error,
    request,
    invalidateCache,
    setData,
  };
} 