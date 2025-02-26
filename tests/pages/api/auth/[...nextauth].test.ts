import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import NextAuth from 'next-auth';
import { authOptions } from '../../../../pages/api/auth/[...nextauth]';

jest.mock('next-auth');

describe('NextAuth API Route', () => {
  it('calls NextAuth with the correct options', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      query: {
        nextauth: ['signin'],
      },
    });

    await NextAuth(req, res, authOptions);

    expect(NextAuth).toHaveBeenCalledWith(
      req,
      res,
      expect.objectContaining({
        providers: expect.arrayContaining([
          expect.objectContaining({ id: 'github' }),
          expect.objectContaining({ id: 'google' }),
        ]),
        callbacks: expect.objectContaining({
          session: expect.any(Function),
          jwt: expect.any(Function),
        }),
      })
    );
  });

  // Add more tests for specific NextAuth behaviors if needed
});
