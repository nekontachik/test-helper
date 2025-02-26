import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { ZodSchema } from 'zod';
import { errorResponse } from '@/lib/api/response';

interface ValidationConfig {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

interface RequestWithParams extends NextRequest {
  context?: {
    params?: Record<string, string>;
  };
}

export async function validateRequestWithConfig(
  request: RequestWithParams,
  config: ValidationConfig
): Promise<Record<string, unknown> | NextResponse> {
  try {
    const result = {
      query: undefined,
      body: undefined,
      params: undefined,
    };

    // Validate query parameters
    if (config.query) {
      const queryParams = Object.fromEntries(request.nextUrl.searchParams);
      result.query = await config.query.parseAsync(queryParams);
    }

    // Validate request body
    if (config.body && request.body) {
      const body = await request.json();
      result.body = await config.body.parseAsync(body);
    }

    // Validate URL parameters
    if (config.params && request.context?.params) {
      result.params = await config.params.parseAsync(request.context.params);
    }

    return result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return new NextResponse(
        JSON.stringify({
          error: 'Validation failed',
          details: error.message,
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    return errorResponse(error);
  }
}

export function validateRequest<T>(schema: ZodSchema<T>) {
  return async (request: NextRequest) => {
    try {
      const body = await request.json();
      return await schema.parseAsync(body);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return new NextResponse(
          JSON.stringify({
            error: 'Validation failed',
            details: error.message,
          }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      return errorResponse(error);
    }
  };
} 