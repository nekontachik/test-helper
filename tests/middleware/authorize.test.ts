import { NextApiResponse } from 'next';
import { authorizeMiddleware } from '../authorize';
import { AuthenticatedRequest } from '../authenticate';
import { AuthorizationError, AuthenticationError } from '@/lib/errors';
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

  it('should throw AuthenticationError if user not present', () => {
    const middleware = authorizeMiddleware({ allowedRoles: [UserRole.ADMIN] });

    expect(() =>
      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as NextApiResponse,
        mockNext
      )
    ).toThrow(AuthenticationError);
  });

  it('should throw AuthorizationError if email not verified when required', () => {
    mockReq.user = {
      id: '1',
      email: 'test@example.com',
      role: UserRole.ADMIN,
      emailVerified: false
    };

    const middleware = authorizeMiddleware({
      allowedRoles: [UserRole.ADMIN],
      requireVerified: true
    });

    expect(() =>
      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as NextApiResponse,
        mockNext
      )
    ).toThrow(AuthorizationError);
  });

  // Add more test cases...
}); 