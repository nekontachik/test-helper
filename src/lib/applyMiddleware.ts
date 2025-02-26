import type { NextApiRequest, NextApiResponse } from 'next';

type Middleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => void;

export function applyMiddleware(middleware: Middleware[]) {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void): void => {
    const runMiddleware = (i: number) => {
      if (i < middleware.length) {
        middleware[i](req, res, () => runMiddleware(i + 1));
      } else {
        next();
      }
    };
    runMiddleware(0);
  };
}
