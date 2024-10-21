import { NextApiRequest, NextApiResponse } from 'next';
import { rateLimitMiddleware } from './rateLimitMiddleware';

type Middleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => Promise<void>
) => Promise<void>;

export function withMiddleware(...middlewares: Middleware[]) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await runMiddleware(req, res, middlewares);
    } catch (error) {
      console.error('Middleware error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
}

async function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  middlewares: Middleware[]
) {
  for (const middleware of middlewares) {
    await new Promise<void>((resolve) => {
      middleware(req, res, async () => {
        await resolve();
      });
    });
  }
}

export const commonMiddleware = [
  rateLimitMiddleware as unknown as Middleware,
  // Add other common middlewares here
];
