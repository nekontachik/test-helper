import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_ORIGINS = [
  process.env.NEXTAUTH_URL,
  'http://localhost:3000',
  // Add your allowed origins here
].filter(Boolean) as string[]; // Filter out any undefined values

const ALLOWED_METHODS = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'OPTIONS',
  'PATCH',
  'HEAD',
];

const ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-API-Key',
  'X-Request-Timestamp',
  'X-Request-Signature',
];

export function corsMiddleware(request: NextRequest): Response | Headers {
  const origin = request.headers.get('origin');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const headers = new Headers(getCorsHeaders(origin));
    
    return new NextResponse(null, {
      status: 204,
      headers,
    });
  }

  // For non-preflight requests, just return the CORS headers
  // that can be applied to the actual response
  return new Headers(getCorsHeaders(origin));
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin);
  const allowedOrigin = isAllowedOrigin ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin || '*', // Fallback to * if no allowed origin
    'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
    'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
} 