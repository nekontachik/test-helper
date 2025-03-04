// Define CacheEntry interface locally if it's not available from the types module
interface CacheEntry {
  data: unknown;
  timestamp: number;
}

// Simple in-memory cache
const cache = new Map<string, CacheEntry>();

export const cacheUtils = {
  /**
   * Get a value from the cache
   */
  get<T>(key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;
    return entry.data as T;
  },

  /**
   * Check if a key exists in the cache and is not expired
   */
  has(key: string, maxAge: number): boolean {
    const entry = cache.get(key);
    if (!entry) return false;
    return Date.now() - entry.timestamp < maxAge;
  },

  /**
   * Set a value in the cache
   */
  set(key: string, data: unknown): void {
    cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  },

  /**
   * Clear the entire cache
   */
  clear(): void {
    cache.clear();
  },

  /**
   * Invalidate cache entries that match a URL pattern
   */
  invalidate(urlPattern: string): void {
    for (const key of cache.keys()) {
      if (key.includes(urlPattern)) {
        cache.delete(key);
      }
    }
  },

  /**
   * Generate a cache key from method, URL and data
   */
  generateKey(method: string, url: string, data?: unknown): string {
    return `${method}:${url}:${JSON.stringify(data)}`;
  }
}; 