import { createRouteHandler, successResponse } from '../[...route]/route';
import { readFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';

// Input validation schema
const querySchema = z.object({
  lines: z.coerce.number().min(1).max(1000).default(100),
  type: z.enum(['combined', 'error', 'routes']).default('combined')
});

export const GET = createRouteHandler({
  GET: async (req) => {
    const { searchParams } = new URL(req.url);
    const query = querySchema.parse({
      lines: searchParams.get('lines'),
      type: searchParams.get('type')
    });

    try {
      const logFilePath = join(process.cwd(), 'logs', `${query.type}.log`);
      const logs = readFileSync(logFilePath, 'utf-8');
      const recentLogs = logs.split('\n').slice(-query.lines).join('\n');
      
      return successResponse({ logs: recentLogs });
    } catch {
      throw new Error('Error retrieving logs');
    }
  }
});
