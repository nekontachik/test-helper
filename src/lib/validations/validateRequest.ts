import { z } from 'zod';
import { ApiError } from '@/lib/api/errorHandler';

export async function validateRequest<T extends z.ZodType>(
  request: Request,
  schema: T,
  options: {
    method?: string;
    parseBody?: boolean;
  } = {}
): Promise<z.infer<T>> {
  // Validate HTTP method if specified
  if (options.method && request.method !== options.method) {
    throw new ApiError(`Method ${request.method} not allowed`, 405);
  }

  try {
    // For GET requests or when parseBody is false, return empty object
    if (request.method === 'GET' || options.parseBody === false) {
      return {} as z.infer<T>;
    }

    const body = await request.json();
    return await schema.parseAsync(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', error.errors);
    }
    throw new ApiError('Invalid request body', 400);
  }
} 