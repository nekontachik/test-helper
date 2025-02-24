import { useMemo } from 'react';
import { CacheManager } from '@/lib/cache/cacheStrategy';
import { CacheableRequest } from '@/types/cache';

export function useCache() {
  const cacheManager = useMemo(() => new CacheManager(), []);

  const fetchWithCache = async (request: CacheableRequest) => {
    return cacheManager.get(request);
  };

  return { fetchWithCache };
} 