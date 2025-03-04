import { NextResponse } from 'next/server';

export enum ErrorType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  RATE_LIMIT = 'rate_limit',
  SERVER_ERROR = 'server_error'
}

interface ErrorResponseOptions {
  status: number;
  type: ErrorType;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Create a consistent error response
 */
export function createErrorResponse(options: ErrorResponseOptions): NextResponse {
  const { status, type, message, details } = options;
  
  return NextResponse.json(
    {
      error: {
        type,
        message,
        ...(details ? { details } : {})
      }
    },
    { status }
  );
}

/**
 * Common error responses
 */
export const ErrorResponses = {
  unauthorized: (message = 'Unauthorized') => 
    createErrorResponse({
      status: 401,
      type: ErrorType.AUTHENTICATION,
      message
    }),
    
  forbidden: (message = 'Insufficient permissions') => 
    createErrorResponse({
      status: 403,
      type: ErrorType.AUTHORIZATION,
      message
    }),
    
  badRequest: (message = 'Invalid request', details?: Record<string, unknown>) => 
    createErrorResponse({
      status: 400,
      type: ErrorType.VALIDATION,
      message,
      ...(details ? { details } : {})
    }),
    
  rateLimit: (message = 'Rate limit exceeded') => 
    createErrorResponse({
      status: 429,
      type: ErrorType.RATE_LIMIT,
      message
    }),
    
  serverError: (message = 'Internal server error') => 
    createErrorResponse({
      status: 500,
      type: ErrorType.SERVER_ERROR,
      message
    })
}; 