import { NextResponse } from 'next/server';
import type { ApiSuccessResponse } from '@/types/api';
import { logger } from '@/lib/utils/logger';

interface ResponseOptions {
  status?: number;
  headers?: Record<string, string>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
  };
}

function createApiResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    status: 200
  };
}

function createApiError(message: string, code: string = 'INTERNAL_ERROR'): ApiErrorResponse {
  return {
    success: false,
    message,
    error: {
      code
    }
  };
}

export class ResponseHandler {
  static success<T>(data: T, options: ResponseOptions = {}): NextResponse<ApiSuccessResponse<T>> {
    const { status = 200, headers = {} } = options;
    
    logger.debug('API Success Response:', { data, status });
    
    return NextResponse.json(
      createApiResponse(data),
      { status, headers }
    );
  }

  static error(error: unknown, options: ResponseOptions = {}): NextResponse<ApiErrorResponse> {
    const { status = 500, headers = {} } = options;
    
    if (error instanceof ApiError) {
      logger.warn('API Error Response:', { error, status: error.status });
      
      return NextResponse.json(
        createApiError(error.message, error.code),
        { status: error.status, headers }
      );
    }

    logger.error('Unexpected API Error:', error);
    
    return NextResponse.json(
      createApiError('Internal Server Error'),
      { status, headers }
    );
  }

  static notFound(message = 'Resource not found'): NextResponse<ApiErrorResponse> {
    return this.error(new ApiError(message, 404, 'NOT_FOUND'));
  }

  static badRequest(message = 'Bad request'): NextResponse<ApiErrorResponse> {
    return this.error(new ApiError(message, 400, 'BAD_REQUEST'));
  }

  static unauthorized(message = 'Unauthorized'): NextResponse<ApiErrorResponse> {
    return this.error(new ApiError(message, 401, 'UNAUTHORIZED'));
  }
} 