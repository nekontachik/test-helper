import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CustomError, ErrorFactory } from '@/lib/errors/ErrorFactory';
import type { ErrorResponse } from '@/lib/errors/types';

export class ApiErrorHandler {
  static handle(error: unknown): NextResponse<ErrorResponse> {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          code: 'VALIDATION_ERROR',
          message: 'Validation error',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    if (error instanceof CustomError) {
      return NextResponse.json(
        { 
          code: error.code,
          message: error.message
        },
        { status: error.statusCode }
      );
    }

    console.error('Unhandled error:', error);
    return NextResponse.json(
      { 
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
} 