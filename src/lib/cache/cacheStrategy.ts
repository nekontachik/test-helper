import type { IDBPDatabase } from 'idb';
import { openDB } from 'idb';
import type { CacheableRequest, CachedResponse } from '@/types/cache';

const CACHE_VERSION = 1;
const DB_NAME = 'app-cache';

export const cacheStrategies = {
  NETWORK_FIRST: 'network-first',
  CACHE_FIRST: 'cache-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
} as const;

export type CacheStrategyType = typeof cacheStrategies[keyof typeof cacheStrategies];

interface CacheConfig {
  strategy: CacheStrategyType;
  maxAge?: number; // in milliseconds
  invalidateOn?: string[]; // array of paths that should invalidate this cache
}

const cacheConfigs: Record<string, CacheConfig> = {
  '/api/projects': {
    strategy: cacheStrategies.NETWORK_FIRST,
    maxAge: 5 * 60 * 1000, // 5 minutes
  },
  '/api/test-runs': {
    strategy: cacheStrategies.STALE_WHILE_REVALIDATE,
    maxAge: 2 * 60 * 1000, // 2 minutes
    invalidateOn: ['/api/projects/*/test-runs/*/execute']
  },
  '/api/test-cases': {
    strategy: cacheStrategies.CACHE_FIRST,
    maxAge: 30 * 60 * 1000, // 30 minutes
  }
};

export class CacheManager {
  private db: Promise<IDBPDatabase>;

  constructor() {
    this.db = openDB(DB_NAME, CACHE_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('requests')) {
          db.createObjectStore('requests', { keyPath: 'url' });
        }
        if (!db.objectStoreNames.contains('responses')) {
          db.createObjectStore('responses', { keyPath: 'url' });
        }
      }
    });
  }

  async get(request: CacheableRequest): Promise<Response | null> {
    const config = this.getConfigForRequest(request);
    
    switch (config.strategy) {
      case cacheStrategies.NETWORK_FIRST:
        return this.networkFirst(request);
      case cacheStrategies.CACHE_FIRST:
        return this.cacheFirst(request);
      case cacheStrategies.STALE_WHILE_REVALIDATE:
        return this.staleWhileRevalidate(request);
      default:
        return this.networkFirst(request);
    }
  }

  private async networkFirst(request: CacheableRequest): Promise<Response | null> {
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        cache: request.cache,
        credentials: request.credentials,
        integrity: request.integrity,
        keepalive: request.keepalive,
        mode: request.mode,
        redirect: request.redirect,
        referrer: request.referrer,
        referrerPolicy: request.referrerPolicy,
        signal: request.signal
      });
      await this.cacheResponse(request.url, response.clone());
      return response;
    } catch {
      return this.getCachedResponse(request.url);
    }
  }

  private async cacheFirst(request: CacheableRequest): Promise<Response | null> {
    const cached = await this.getCachedResponse(request.url);
    if (cached) return cached;

    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      cache: request.cache,
      credentials: request.credentials,
      integrity: request.integrity,
      keepalive: request.keepalive,
      mode: request.mode,
      redirect: request.redirect,
      referrer: request.referrer,
      referrerPolicy: request.referrerPolicy,
      signal: request.signal
    });
    await this.cacheResponse(request.url, response.clone());
    return response;
  }

  private async staleWhileRevalidate(request: CacheableRequest): Promise<Response | null> {
    const cached = await this.getCachedResponse(request.url);
    
    // Start network request
    const networkPromise = fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      cache: request.cache,
      credentials: request.credentials,
      integrity: request.integrity,
      keepalive: request.keepalive,
      mode: request.mode,
      redirect: request.redirect,
      referrer: request.referrer,
      referrerPolicy: request.referrerPolicy,
      signal: request.signal
    }).then(async response => {
      await this.cacheResponse(request.url, response.clone());
      return response;
    });

    // Return cached response immediately if available
    if (cached) return cached;

    // Otherwise wait for network
    return networkPromise;
  }

  private getConfigForRequest(request: CacheableRequest): CacheConfig {
    const path = new URL(request.url).pathname;
    return cacheConfigs[path] || { strategy: cacheStrategies.NETWORK_FIRST };
  }

  private async getCachedResponse(url: string): Promise<Response | null> {
    const db = await this.db;
    const tx = db.transaction('responses', 'readonly');
    const store = tx.objectStore('responses');
    const cached: CachedResponse | undefined = await store.get(url);

    if (!cached) return null;

    const config = this.getConfigForRequest({
      url,
      method: 'GET',
      headers: new Headers()
    });
    if (config.maxAge && Date.now() - cached.timestamp > config.maxAge) {
      await this.deleteCachedResponse(url);
      return null;
    }

    return new Response(JSON.stringify(cached.data), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async cacheResponse(url: string, response: Response): Promise<void> {
    const db = await this.db;
    const tx = db.transaction('responses', 'readwrite');
    const store = tx.objectStore('responses');

    const data = await response.clone().json();
    const cached: CachedResponse = {
      url,
      data,
      timestamp: Date.now()
    };

    await store.put(cached);
  }

  private async deleteCachedResponse(url: string): Promise<void> {
    const db = await this.db;
    const tx = db.transaction('responses', 'readwrite');
    const store = tx.objectStore('responses');
    await store.delete(url);
  }
} 