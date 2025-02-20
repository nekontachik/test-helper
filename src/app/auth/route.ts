import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import logger from '@/lib/utils/logger';

export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  logger.debug({ requestId }, '[AUTH] Processing request');

  try {
    const session = await getServerSession(authOptions);
    
    if (session) {
      logger.info({ requestId, userId: session.user.id }, '[AUTH] Redirecting authenticated user');
      return redirect('/dashboard');
    }

    logger.info({ requestId }, '[AUTH] Redirecting to signin');
    return redirect('/auth/signin');
  } catch (error) {
    logger.error({ requestId, error }, '[AUTH] Error in auth route');
    return redirect('/auth/signin');
  }
} 