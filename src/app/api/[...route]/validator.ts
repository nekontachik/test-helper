import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import logger from '@/lib/utils/logger';

interface ValidationOptions<T, Q = unknown, P = unknown> {
  body?: z.ZodType<T>;
  query?: z.ZodType<Q>;
  params?: z.ZodType<P>;
}

interface ValidatedData<T, Q = unknown, P = unknown> {
  body?: T;
  query?: Q;
  params?: P;
}

export const withValidation = <T, Q = unknown, P = unknown>(
  handler: (req: NextRequest, validatedData: ValidatedData<T, Q, P>) => Promise<Response>,
  options: ValidationOptions<T, Q, P>
) => {
  return async (req: NextRequest): Promise<Response> => {
    try {
      const validatedData: ValidatedData<T, Q, P> = {};

      // Validate query parameters
      if (options.query) {
        const { searchParams } = new URL(req.url);
        const queryData = Object.fromEntries(searchParams);
        validatedData.query = await options.query.parseAsync(queryData);
      }

      // Validate request body for POST, PUT, PATCH
      if (options.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const bodyData = await req.json();
        validatedData.body = await options.body.parseAsync(bodyData);
      }

      // Validate URL parameters
      if (options.params) {
        const url = new URL(req.url);
        const params = url.pathname
          .split('/')
          .filter(Boolean)
          .reduce<Record<string, string>>((acc, part, i) => ({
            ...acc,
            [i]: part
          }), {});
        validatedData.params = await options.params.parseAsync(params);
      }

      return handler(req, validatedData);
    } catch (error) {
      logger.warn('Validation error', { error });

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message
            }))
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }
  };
}; 