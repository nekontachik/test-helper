import { NextApiRequest, NextApiResponse } from 'next';
import logger from '@/lib/logger';

export function errorMiddleware(
  err: any,
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (err.name === 'ValidationError') {
    logger.error('Validation Error', err.message);
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'NotFoundError') {
    logger.error('Not Found Error', err.message);
    return res.status(404).json({ error: 'Resource not found' });
  }

  if (err.name === 'DatabaseError') {
    logger.error('Database Error', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }

  logger.error('Application Error', err.message);
  return res.status(500).json({ error: 'Internal server error' });
}
