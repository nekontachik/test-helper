import { authenticate } from '../authenticate';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

jest.mock('next-auth/jwt');

describe('authenticate middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login when no token', async () => {
    (getToken as jest.Mock).mockResolvedValue(null);
    const request = new NextRequest('http://localhost/protected');
    const response = await authenticate(request);
    expect(response.status).toBe(302);
  });
}); 