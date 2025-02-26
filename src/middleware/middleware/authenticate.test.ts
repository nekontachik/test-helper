import type { NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import type { AuthenticatedRequest } from './authenticate';
import { authenticateMiddleware } from './authenticate';
import { AuthenticationError } from '../src/lib/errors';

jest.mock('jsonwebtoken');

describe('authenticateMiddleware', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<NextApiResponse>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  it('should throw AuthenticationError if no authorization header', () => {
    expect(() =>
      authenticateMiddleware(
        mockReq as AuthenticatedRequest,
        mockRes as NextApiResponse,
        mockNext
      )
    ).toThrow(AuthenticationError);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should throw AuthenticationError if invalid token', () => {
    mockReq.headers = { authorization: 'Bearer invalid_token' };
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    expect(() =>
      authenticateMiddleware(
        mockReq as AuthenticatedRequest,
        mockRes as NextApiResponse,
        mockNext
      )
    ).toThrow(AuthenticationError);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should set user in request and call next if valid token', () => {
    const mockUser = { id: '1', email: 'test@example.com', role: 'user' };
    mockReq.headers = { authorization: 'Bearer valid_token' };
    (jwt.verify as jest.Mock).mockReturnValue(mockUser);

    authenticateMiddleware(
      mockReq as AuthenticatedRequest,
      mockRes as NextApiResponse,
      mockNext
    );

    expect(mockReq.user).toEqual(mockUser);
    expect(mockNext).toHaveBeenCalled();
  });
});
