import { z } from 'zod';
import { validateRequest } from '@/lib/validations/validateRequest';
import { ResponseHandler } from './responseHandler';
import { logger } from '@/lib/utils/logger';

interface EndpointConfig<T extends z.ZodType> {
  method: string;
  schema?: T;
  handler: (data: z.infer<T>) => Promise<any>;
}

export function createEndpoint<T extends z.ZodType>({ 
  method, 
  schema, 
  handler 
}: EndpointConfig<T>) {
  return async (req: Request) => {
    try {
      // Validate request
      const data = await validateRequest(req, schema, { method });
      
      // Execute handler
      const result = await handler(data);
      
      return ResponseHandler.success(result);
    } catch (error) {
      return ResponseHandler.error(error);
    }
  };
} 