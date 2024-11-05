import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { middlewareHandler } from './handler';
import { MIDDLEWARE_CONFIG } from './config';
import { logger } from '@/lib/utils/logger';

jest.mock('next-auth/jwt');
jest.mock('@/lib/utils/logger');
jest.mock('./config', () => ({
  MIDDLEWARE_CONFIG: {
    auth: {
      publicPaths: ['/auth/signin', '/auth/signup'],
    },
    roleAccess: {
      '/admin': ['ADMIN'],
    },
  },
}));

describe('Middleware Handler', () => {
  const mockRequest = (pathname: string): NextRequest => {
    return new NextRequest(new URL(`http://localhost${pathname}`));
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows access to public paths', async () => {
    const req = mockRequest('/auth/signin');
    const response = await middlewareHandler(req);
    expect(response.status).toBe(200);
  });

  it('redirects to signin when no token is present', async () => {
    (getToken as jest.Mock).mockResolvedValue(null);
    const req = mockRequest('/projects');
    const response = await middlewareHandler(req);
    
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toContain('/auth/signin');
  });

  it('allows access when user has valid role', async () => {
    (getToken as jest.Mock).mockResolvedValue({
      sub: 'user-123',
      role: 'USER',
    });
    
    const req = mockRequest('/projects');
    const response = await middlewareHandler(req);
    
    expect(response.status).toBe(200);
  });

  it('returns 403 when user role is invalid', async () => {
    (getToken as jest.Mock).mockResolvedValue({
      sub: 'user-123',
      role: 'INVALID_ROLE',
    });
    
    const req = mockRequest('/projects');
    const response = await middlewareHandler(req);
    
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Invalid user role' });
  });

  it('redirects to unauthorized when user lacks required role', async () => {
    (getToken as jest.Mock).mockResolvedValue({
      sub: 'user-123',
      role: 'USER',
    });
    
    const req = mockRequest('/admin');
    const response = await middlewareHandler(req);
    
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toContain('/unauthorized');
  });

  it('skips middleware for static files', async () => {
    const req = mockRequest('/images/test.png');
    const response = await middlewareHandler(req);
    
    expect(response.status).toBe(200);
  });

  it('handles internal server errors', async () => {
    (getToken as jest.Mock).mockRejectedValue(new Error('Internal error'));
    const req = mockRequest('/projects');
    const response = await middlewareHandler(req);
    
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Internal server error' });
    expect(logger.error).toHaveBeenCalled();
  });
}); 