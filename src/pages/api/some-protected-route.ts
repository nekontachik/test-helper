import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '@/middleware/auth';
import { Action, Resource } from '@/types/rbac';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    const authResult = await authMiddleware({
      session,
      requireAuth: true,
      requireVerified: true,
      action: Action.READ,
      resource: Resource.PROJECT
    });

    if (!authResult.success) {
      return res.status(authResult.status ?? 401).json({ 
        error: authResult.error 
      });
    }

    // Your protected route logic here
    return res.status(200).json({ message: 'This is a protected route' });
  } catch (error) {
    console.error('Protected route error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
