import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import logger from '@/lib/utils/logger';
import { ZodError } from 'zod';

// Standard API response type
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// Base handler type
type RouteHandler = (req: NextRequest) => Promise<Response>;

// HTTP method handlers
interface MethodHandlers {
  GET?: RouteHandler;
  POST?: RouteHandler;
  PUT?: RouteHandler;
  DELETE?: RouteHandler;
  PATCH?: RouteHandler;
}

// Error response helper
const errorResponse = (error: unknown, status = 500): Response => {
  let message = 'Internal server error';
  let statusCode = status;

  if (error instanceof ZodError) {
    message = 'Validation error';
    statusCode = 400;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return NextResponse.json(
    { error: message },
    { status: statusCode }
  );
};

// Create route handler with automatic logging and error handling
export const createRouteHandler = (handlers: MethodHandlers) => {
  return async (req: NextRequest): Promise<Response> => {
    return logger.logRoute(req, async () => {
      try {
        const method = req.method as keyof MethodHandlers;
        const handler = handlers[method];

        if (!handler) {
          return NextResponse.json(
            { error: `Method ${method} not allowed` },
            { status: 405 }
          );
        }

        return await handler(req);
      } catch (error) {
        return errorResponse(error);
      }
    });
  };
};

// Success response helper
export const successResponse = <T>(data: T, status = 200): Response => {
  return NextResponse.json({ data }, { status });
}; 