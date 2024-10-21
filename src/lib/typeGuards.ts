import { NextApiRequest, NextApiResponse } from 'next';

export function isNextApiRequest(req: unknown): req is NextApiRequest {
  return (
    typeof req === 'object' &&
    req !== null &&
    'query' in req &&
    'method' in req &&
    'env' in req
  );
}

export function isNextApiResponse(res: unknown): res is NextApiResponse {
  return (
    typeof res === 'object' &&
    res !== null &&
    'status' in res &&
    'json' in res &&
    !('_getJSONData' in res)
  );
}
