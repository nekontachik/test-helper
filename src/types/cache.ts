export type CacheableRequest = Omit<Request, 'cache'> & {
  url: string;
  method: string;
  headers: Headers;
  cache?: RequestCache | undefined;
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