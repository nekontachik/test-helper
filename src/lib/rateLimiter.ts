import type { NextApiRequest, NextApiResponse } from 'next';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

const applyMiddleware =
  (middleware: any) => (request: NextApiRequest, response: NextApiResponse) =>
    new Promise((resolve, reject) => {
      middleware(request, response, (result: Error | unknown) =>
        result instanceof Error ? reject(result) : resolve(result)
      );
    });

const getIP = (request: NextApiRequest) =>
  request.headers['x-forwarded-for'] ||
  request.headers['x-real-ip'] ||
  request.socket.remoteAddress;

export const getRateLimitMiddlewares = ({
  limit = 10,
  windowMs = 60 * 1000,
  delayAfter = Math.round(10 / 2),
  delayMs = 500,
} = {}) => [
  slowDown({ keyGenerator: getIP as any, windowMs, delayAfter, delayMs }),
  rateLimit({ keyGenerator: getIP as any, windowMs, max: limit }),
];

const middlewares = getRateLimitMiddlewares();

async function applyRateLimit(
  request: NextApiRequest,
  response: NextApiResponse
) {
  await Promise.all(
    middlewares
      .map(applyMiddleware)
      .map((middleware) => middleware(request, response))
  );
}

export default applyRateLimit;
