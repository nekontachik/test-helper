import type { z } from 'zod';
import { validateRequest } from '@/lib/validations/validateRequest';
import { ResponseHandler } from './responseHandler';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { logger } from '@/lib/utils/logger';

interface EndpointConfig<T extends z.ZodType> {
  method: string;
  schema?: T;
  handler: (data: z.infer<T>) => Promise<unknown>;
}

export function createEndpoint<T extends z.ZodType>({ 
  method, 
  schema, 
  handler 
}: EndpointConfig<T>): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    try {
      // Validate request
      const data = await validateRequest(req, schema as z.ZodType, { method });
      
      // Execute handler
      const result = await handler(data);
      
      return ResponseHandler.success(result);
    } catch (error) {
      return ResponseHandler.error(error);
    }
  };
} 