import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ZodSchema } from 'zod';
import { errorResponse } from '@/lib/api/response';

export interface ValidationConfig {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export interface RequestWithParams extends NextRequest {
  context?: {
    params?: Record<string, string>;
  };
}

export async function validateRequest(
  request: RequestWithParams,
  config: ValidationConfig
) {
  try {
    // Validate query parameters
    if (config.query) {
      const queryParams = Object.fromEntries(request.nextUrl.searchParams);
      await config.query.parseAsync(queryParams);
    }

    // Validate request body
    if (config.body && request.body) {
      const body = await request.json();
      await config.body.parseAsync(body);
    }

    // Validate URL parameters
    if (config.params && request.context?.params) {
      await config.params.parseAsync(request.context.params);
    }

    return NextResponse.next();
  } catch (error) {
    return errorResponse(error);
  }
} 