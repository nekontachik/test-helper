import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { NextApiRequest } from 'next';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getURL(path: string = ''): string {
  const url = process.env.NEXT_PUBLIC_APP_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  
  return `${url.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export function isNextApiRequest(request: Request | NextApiRequest): request is NextApiRequest {
  return 'query' in request && 'method' in request;
}

export function convertRequestToBase(request: Request | NextApiRequest): Request {
  if (isNextApiRequest(request)) {
    const url = new URL(request.url || '', getURL());
    return new Request(url, {
      method: request.method,
      headers: new Headers(request.headers as HeadersInit),
      body: request.body ? JSON.stringify(request.body) : null
    });
  }
  return request as Request;
}
