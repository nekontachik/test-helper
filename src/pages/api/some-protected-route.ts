import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '@/middleware/auth';
import { Action, Resource } from '@/types/rbac';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await new Promise<void>((resolve) => {
    authMiddleware(req, res, resolve, {
      permissions: [{
        action: Action.READ,
        resource: Resource.PROJECT
      }]
    });
  });

  // Your protected route logic here
  res.status(200).json({ message: 'This is a protected route' });
}
