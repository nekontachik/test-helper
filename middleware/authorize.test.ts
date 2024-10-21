import { NextApiResponse } from 'next';
import { authorizeMiddleware } from './authorize';
import { AuthorizationError } from '@/lib/errors';
import { AuthenticatedRequest } from './authenticate';

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
    const middleware = authorizeMiddleware(['admin']);

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
    mockReq.user = { id: '1', email: 'test@example.com', role: 'user' };
    const middleware = authorizeMiddleware(['admin']);

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
    mockReq.user = { id: '1', email: 'test@example.com', role: 'admin' };
    const middleware = authorizeMiddleware(['admin', 'user']);

    middleware(
      mockReq as AuthenticatedRequest,
      mockRes as NextApiResponse,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
  });
});
