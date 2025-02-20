import { NextApiRequest, NextApiResponse } from 'next';
import logger from '@/lib/logger';

export function errorHandler(
  err: any,
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (err.name === 'ValidationError') {
    logger.error('Validation Error', { error: err.message, url: req.url });
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'NotFoundError') {
    logger.error('Not Found Error', { error: err.message, url: req.url });
    return res.status(404).json({ error: 'Resource not found' });
  }

  if (err.name === 'DatabaseError') {
    logger.error('Database Error', { error: err.message, url: req.url });
    return res.status(500).json({ error: 'Internal server error' });
  }

  logger.error('Application Error', { error: err.message, url: req.url });
  return res.status(500).json({ error: 'Internal server error' });
}
