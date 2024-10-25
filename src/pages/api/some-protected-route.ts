import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '@/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await new Promise<void>((resolve) => {
    authMiddleware(req, res, () => resolve());
  });

  // Your protected route logic here
  res.status(200).json({ message: 'This is a protected route' });
}
