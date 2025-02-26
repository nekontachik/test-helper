import type { NextApiResponse } from 'next';
import { authorizeMiddleware } from './authorize';
import { AuthorizationError } from '@/lib/errors';
import type { AuthenticatedRequest } from './authenticate';
import { UserRole } from '@/types/auth';

describe('authorizeMiddleware', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<NextApiResponse>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {};
    mockRes = {};
    mockNext = jest.fn();
  });

  it('should throw AuthorizationError if user not authenticated', () => {
    const middleware = authorizeMiddleware({
      allowedRoles: [UserRole.ADMIN]
    });

    expect(() =>
      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as NextApiResponse,
        mockNext
      )
    ).toThrow(AuthorizationError);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should throw AuthorizationError if user role not allowed', () => {
    mockReq.user = { id: '1', email: 'test@example.com', role: UserRole.USER };
    const middleware = authorizeMiddleware({
      allowedRoles: [UserRole.ADMIN]
    });

    expect(() =>
      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as NextApiResponse,
        mockNext
      )
    ).toThrow(AuthorizationError);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next if user role is allowed', () => {
    mockReq.user = { id: '1', email: 'test@example.com', role: UserRole.ADMIN };
    const middleware = authorizeMiddleware({
      allowedRoles: [UserRole.ADMIN, UserRole.USER]
    });

    middleware(
      mockReq as AuthenticatedRequest,
      mockRes as NextApiResponse,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
  });
});
