export type CacheableRequest = {
  url: string;
  method: string;
  headers: Headers;
  cache?: RequestCache;
  body?: BodyInit | null;
  credentials?: RequestCredentials;
  integrity?: string;
  keepalive?: boolean;
  mode?: RequestMode;
  redirect?: RequestRedirect;
  referrer?: string;
  referrerPolicy?: ReferrerPolicy;
  signal?: AbortSignal | null;
};

export interface CacheStrategy {
  get(request: CacheableRequest): Promise<Response | null>;
  put(request: CacheableRequest, response: Response): Promise<void>;
  delete(request: CacheableRequest): Promise<void>;
}

export interface CachedResponse {
  url: string;
  data: unknown;
  timestamp: number;
} 