import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from './auth';
import { rateLimitMiddleware } from './rateLimit';
import { auditLogMiddleware } from './audit';
import { corsMiddleware } from './cors';
import { apiKeyMiddleware } from './apiKey';
import { securityHeaders } from './securityHeaders';
import { middlewareHandler } from './handler';

type RequestType = NextRequest | NextApiRequest;
type HandlerFunction = (request: RequestType, ...args: any[]) => Promise<Response | void>;

const isNextApiRequest = (request: RequestType): request is NextApiRequest => {
  return 'query' in request && 'cookies' in request && 'env' in request;
};

const convertRequestToBase = (request: NextRequest): Request => {
  return new Request(request.url, {
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
    signal: request.signal,
  });
};

export const withAuth = (handler: HandlerFunction) => async (request: RequestType, ...args: any[]) => {
  try {
    if (isNextApiRequest(request)) {
      await authMiddleware(request, args[0], args[1]);
    } else {
      const baseRequest = convertRequestToBase(request);
      await authMiddleware(baseRequest as any, args[0], args[1]);
    }
    return handler(request, ...args);
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
};

export const withRateLimit = (handler: HandlerFunction) => async (request: RequestType) => {
  try {
    const req = isNextApiRequest(request) ? new Request(request.url!) : convertRequestToBase(request);
    await rateLimitMiddleware(req);
    return handler(request);
  } catch (error) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
};

export const withAudit = (handler: HandlerFunction) => async (request: RequestType) => {
  try {
    const req = isNextApiRequest(request) ? new Request(request.url!) : convertRequestToBase(request);
    await auditLogMiddleware(req);
    return handler(request);
  } catch (error) {
    console.error('Audit logging failed:', error);
    return handler(request);
  }
};

export const withCsrf = (handler: HandlerFunction) => async (request: RequestType) => {
  try {
    if (!isNextApiRequest(request)) {
      await corsMiddleware(request);
    }
    return handler(request);
  } catch (error) {
    return NextResponse.json({ error: 'CSRF check failed' }, { status: 403 });
  }
};

export const withApiKey = (handler: HandlerFunction) => async (request: RequestType) => {
  try {
    const req = isNextApiRequest(request) ? new Request(request.url!) : convertRequestToBase(request);
    await apiKeyMiddleware(req as NextRequest);
    return handler(request);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }
};

export const withSecurityHeaders = (handler: HandlerFunction) => async (request: RequestType) => {
  try {
    const response = await handler(request);
    if (response instanceof Response) {
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Security check failed' }, { status: 500 });
  }
};

export const createSecureHandler = (handler: HandlerFunction) => {
  return withSecurityHeaders(
    withAuth(
      withRateLimit(
        withAudit(
          withCsrf(
            withApiKey(handler)
          )
        )
      )
    )
  );
};