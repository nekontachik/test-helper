import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getErrorMessage } from '@/lib/utils/error';

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 400,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function createApiResponse<T>(
  data?: T,
  meta?: ApiResponse['meta']
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta,
  };
}

export function createErrorResponse(
  error: unknown,
  defaultMessage = 'An unexpected error occurred'
): ApiResponse {
  if (error instanceof ApiError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }

  if (error instanceof ZodError) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.errors,
      },
    };
  }

  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: getErrorMessage(error) || defaultMessage,
    },
  };
}

export function apiResponse<T>(
  data?: T,
  meta?: ApiResponse['meta'],
  status: number = 200
): NextResponse {
  return NextResponse.json(createApiResponse(data, meta), { status });
}

export function errorResponse(
  error: unknown,
  status?: number
): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      createErrorResponse(error),
      { status: error.status }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      createErrorResponse(error),
      { status: 400 }
    );
  }

  return NextResponse.json(
    createErrorResponse(error),
    { status: status || 500 }
  );
} 