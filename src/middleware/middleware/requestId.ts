import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

export function requestIdMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => Promise<void>
): void {
  const requestId = uuidv4();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}
