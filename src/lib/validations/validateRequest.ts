import { z } from 'zod';
import { ValidationError } from '@/lib/errors/ErrorFactory';

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
    throw new ValidationError(`Method ${request.method} not allowed`);
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
      throw new ValidationError('Validation failed', { errors: error.errors });
    }
    throw new ValidationError('Invalid request body');
  }
} 