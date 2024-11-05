import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { 
  AppError, 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError
} from '@/lib/errors';

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  status: number;
}

export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  console.error('API Error:', error);

  // Handle known application errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.errors,
        },
      },
      { status: 400 }
    );
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json(
          {
            error: {
              code: 'UNIQUE_CONSTRAINT_VIOLATION',
              message: 'A record with this value already exists',
              details: error.meta,
            },
          },
          { status: 409 }
        );
      case 'P2025':
        return NextResponse.json(
          {
            error: {
              code: 'NOT_FOUND',
              message: 'Record not found',
              details: error.meta,
            },
          },
          { status: 404 }
        );
      default:
        return NextResponse.json(
          {
            error: {
              code: 'DATABASE_ERROR',
              message: 'Database operation failed',
              details: error.message,
            },
          },
          { status: 500 }
        );
    }
  }

  // Handle unexpected errors
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 }
  );
} 