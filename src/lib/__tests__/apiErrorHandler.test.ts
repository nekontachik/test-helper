import { handleApiError } from '../apiErrorHandler';
import { AuthError } from '../errors/AuthError';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

describe('handleApiError', () => {
  it('handles ZodError', () => {
    const error = new ZodError([]);
    const response = handleApiError(error);
    expect(response.status).toBe(400);
  });

  it('handles AuthError', () => {
    const error = new AuthError('Unauthorized', 'UNAUTHORIZED', 401);
    const response = handleApiError(error);
    expect(response.status).toBe(401);
  });

  it('handles PrismaError', () => {
    const error = new Prisma.PrismaClientKnownRequestError('Error', {
      code: 'P2002',
      clientVersion: '2.0.0',
    });
    const response = handleApiError(error);
    expect(response.status).toBe(400);
  });
}); 