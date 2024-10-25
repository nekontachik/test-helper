import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function authMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  (req as any).user = session.user;

  next();
}
