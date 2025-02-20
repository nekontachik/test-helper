import { NextResponse } from 'next/server';
import { ApiResponse, ApiError, createApiResponse, createApiError } from '@/types/api';
import { logger } from '@/lib/utils/logger';

interface ResponseOptions {
  status?: number;
  headers?: Record<string, string>;
}

export class ResponseHandler {
  static success<T>(data: T, options: ResponseOptions = {}) {
    const { status = 200, headers = {} } = options;
    
    logger.debug('API Success Response:', { data, status });
    
    return NextResponse.json(
      createApiResponse(data),
      { status, headers }
    );
  }

  static error(error: unknown, options: ResponseOptions = {}) {
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

  static notFound(message = 'Resource not found') {
    return this.error(new ApiError(message, 404, 'NOT_FOUND'));
  }

  static badRequest(message = 'Bad request') {
    return this.error(new ApiError(message, 400, 'BAD_REQUEST'));
  }

  static unauthorized(message = 'Unauthorized') {
    return this.error(new ApiError(message, 401, 'UNAUTHORIZED'));
  }
} 