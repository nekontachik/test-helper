import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { projectId, suiteId } = req.query;

  if (typeof projectId !== 'string' || typeof suiteId !== 'string') {
    return res.status(400).json({ error: 'Invalid projectId or suiteId' });
  }

  // ... rest of the handler logic, updating 'id' to 'suiteId' where necessary ...
}
