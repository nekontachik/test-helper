import { NextApiRequest, NextApiResponse } from 'next';
import { AppError } from '@/lib/errors';

export function errorHandler(err: Error, req: NextApiRequest, res: NextApiResponse) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  console.error('Unhandled error:', err);

  return res.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred',
  });
}
