import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/utils/logger';

export function createRouteHandler<T extends z.ZodType>({ 
  schema, 
  handler 
}: { 
  schema: T,
  handler: (validatedData: z.infer<T>) => Promise<NextResponse>
}) {
  return async (req: Request) => {
    try {
      const data = await req.json();
      const validated = await schema.parseAsync(data);
      return handler(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Validation error:', error.errors);
        return NextResponse.json(
          { error: 'Validation failed', details: error.errors },
          { status: 400 }
        );
      }

      logger.error('Route handler error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
} 