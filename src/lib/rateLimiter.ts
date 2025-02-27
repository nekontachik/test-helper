import type { NextApiRequest, NextApiResponse } from 'next';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

type MiddlewareFunction = (request: NextApiRequest, response: NextApiResponse) => Promise<unknown>;
type RateLimitMiddleware = (req: NextApiRequest, res: NextApiResponse, next: (result: Error | unknown) => void) => void;

const applyMiddleware =
  (middleware: RateLimitMiddleware): MiddlewareFunction => (request: NextApiRequest, response: NextApiResponse): Promise<unknown> =>
    new Promise((resolve, reject) => {
      middleware(request, response, (result: Error | unknown) =>
        result instanceof Error ? reject(result) : resolve(result)
      );
    });

const getIP = (request: NextApiRequest): string | undefined =>
  request.headers['x-forwarded-for'] ||
  request.headers['x-real-ip'] ||
  request.socket.remoteAddress;

interface RateLimitOptions {
  limit?: number;
  windowMs?: number;
  delayAfter?: number;
  delayMs?: number;
}

export const getRateLimitMiddlewares = ({
  limit = 10,
  windowMs = 60 * 1000,
  delayAfter = Math.round(10 / 2),
  delayMs = 500,
}: RateLimitOptions = {}): RateLimitMiddleware[] => [
  slowDown({ keyGenerator: getIP as unknown as (req: unknown) => string, windowMs, delayAfter, delayMs }),
  rateLimit({ keyGenerator: getIP as unknown as (req: unknown) => string, windowMs, max: limit }),
];

const middlewares = getRateLimitMiddlewares();

async function applyRateLimit(
  request: NextApiRequest,
  response: NextApiResponse
): Promise<void> {
  await Promise.all(
    middlewares
      .map(applyMiddleware)
      .map((middleware) => middleware(request, response))
  );
}

export default applyRateLimit;
