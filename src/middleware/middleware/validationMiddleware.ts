import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { z } from 'zod';
import { logger } from '@/lib/utils/logger';

export function createValidationMiddleware<T extends z.ZodType>(schema: T) {
  return async function validationMiddleware(
    request: NextRequest,
    next: () => Promise<NextResponse>
  ) {
    try {
      const contentType = request.headers.get('content-type');
      let body = {};

      if (contentType?.includes('application/json')) {
        body = await request.json();
      }

      const result = await schema.safeParseAsync(body);

      if (!result.success) {
        logger.warn('Validation failed:', result.error);
        
        return NextResponse.json(
          { 
            error: 'Validation failed', 
            details: result.error.errors 
          },
          { status: 400 }
        );
      }

      // Add validated data to request context
      request.validated = result.data;
      
      return next();
    } catch (error) {
      logger.error('Validation middleware error:', error);
      
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }
  };
}

// Type augmentation for NextRequest
declare module 'next/server' {
  interface NextRequest {
    validated?: any;
  }
}
