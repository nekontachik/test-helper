import type { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/lib/logger';

interface AppError {
  name: string;
  message: string;
}

export function errorMiddleware(
  err: unknown,
  req: NextApiRequest,
  res: NextApiResponse
): void {
  const error = err as AppError;
  
  if (error.name === 'ValidationError') {
    logger.error('Validation Error', error.message);
    return res.status(400).json({ error: error.message });
  }

  if (error.name === 'NotFoundError') {
    logger.error('Not Found Error', error.message);
    return res.status(404).json({ error: 'Resource not found' });
  }

  if (error.name === 'DatabaseError') {
    logger.error('Database Error', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }

  logger.error('Application Error', error.message);
  return res.status(500).json({ error: 'Internal server error' });
}
