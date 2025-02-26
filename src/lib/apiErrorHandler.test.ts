import { handleApiError } from './apiErrorHandler';
import { ZodError, z } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NextResponse as _NextResponse } from 'next/server';

describe('handleApiError', () => {
  it('should handle ZodError correctly', () => {
    const schema = z.object({ name: z.string() });
    const parseResult = schema.safeParse({ name: 123 });
    
    if (!parseResult.success) {
      const error = new ZodError(parseResult.error.errors);
      const response = handleApiError(error);
      const data = response.json();

      expect(response.status).toBe(400);
      expect(data).resolves.toEqual({
        error: 'Validation error',
        details: expect.any(Array)
      });
    } else {
      throw new Error('Validation should have failed');
    }
  });

  it('should handle PrismaClientKnownRequestError correctly', () => {
    const error = new PrismaClientKnownRequestError(
      'Record not found',
      { 
        code: 'P2025',
        clientVersion: '5.0.0',
      }
    );

    const response = handleApiError(error);
    const data = response.json();

    expect(response.status).toBe(500);
    expect(data).resolves.toEqual({
      error: 'Database error',
      code: 'P2025',
      details: expect.any(String)
    });
  });

  it('should handle standard Error correctly', () => {
    const error = new Error('Something went wrong');
    
    const response = handleApiError(error);
    const data = response.json();

    expect(response.status).toBe(500);
    expect(data).resolves.toEqual({
      error: 'Something went wrong'
    });
  });

  it('should handle unknown errors correctly', () => {
    const error = 'unexpected error';
    
    const response = handleApiError(error);
    const data = response.json();

    expect(response.status).toBe(500);
    expect(data).resolves.toEqual({
      error: 'Internal server error'
    });
  });
});
