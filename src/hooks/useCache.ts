import { useMemo } from 'react';
import { CacheManager } from '@/lib/cache/cacheStrategy';
import type { CacheableRequest } from '@/types/cache';

export function useCache(): {
  fetchWithCache: (request: CacheableRequest) => Promise<unknown>;
} {
  const cacheManager = useMemo(() => new CacheManager(), []);

  const fetchWithCache = async (request: CacheableRequest): Promise<unknown> => {
    return cacheManager.get(request);
  };

  return { fetchWithCache };
} 