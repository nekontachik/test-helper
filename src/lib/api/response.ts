import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { logger } from '@/lib/utils/logger';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiResponseData<T> = {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
} | {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

function createErrorData(
  message: string,
  code: string = 'INTERNAL_ERROR',
  details?: unknown
): ApiErrorResponse {
  return {
    success: false,
    error: {
      message,
      code,
      details,
    },
  };
}

function createSuccessData<T>(
  data: T,
  meta?: ApiSuccessResponse<T>['meta']
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    meta,
  };
}

export function errorResponse(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof ApiError) {
    return NextResponse.json(
      createErrorData(error.message, error.code, error.details),
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      createErrorData('Validation failed', 'VALIDATION_ERROR', error.errors),
      { status: 400 }
    );
  }

  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
  logger.error(errorMessage, error);
  
  return NextResponse.json(
    createErrorData('Internal server error', 'INTERNAL_ERROR'),
    { status: 500 }
  );
}

export function successResponse<T>(
  data: T,
  meta?: ApiSuccessResponse<T>['meta']
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(createSuccessData(data, meta));
}

export function apiResponse<T>(
  data: T,
  meta?: ApiSuccessResponse<T>['meta'],
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(createSuccessData(data, meta), { status });
} 