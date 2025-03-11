import type { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/lib/logger';

export async function performanceLogger(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => Promise<void>
): Promise<void> {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;

  logger.info('API Request completed', {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    duration: `${duration.toFixed(2)}ms`,
  });
}
