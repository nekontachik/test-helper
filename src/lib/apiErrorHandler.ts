import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import logger from '@/lib/logger';

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
  code?: string;
}

export function apiErrorHandler(error: unknown): NextResponse<ApiErrorResponse> {
  logger.error('API Error:', error);

  if (error instanceof ZodError) {
    return NextResponse.json(
      { 
        error: 'Validation error', 
        details: error.errors 
      },
      { status: 400 }
    );
  }

  if (error instanceof PrismaClientKnownRequestError) {
    return NextResponse.json(
      { 
        error: 'Database error',
        code: error.code,
        details: error.message
      },
      { status: 500 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
