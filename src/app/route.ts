import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import logger from '@/lib/utils/logger';

export async function GET(): Promise<never> {
  const requestId = crypto.randomUUID();
  logger.debug('[ROOT] Handling root route request', { requestId });

  try {
    const session = await getServerSession(authOptions);
    logger.debug('[ROOT] Session check', { 
      requestId, 
      hasSession: !!session 
    });

    if (!session) {
      logger.info('[ROOT] No session found, redirecting to signin', { requestId });
      redirect('/auth/signin');
    }

    logger.info('[ROOT] Session found, redirecting to dashboard', { 
      requestId,
      userId: session.user.id 
    });
    redirect('/dashboard');
  } catch (error) {
    logger.error('[ROOT] Error handling root route', { 
      requestId,
      error 
    });
    redirect('/auth/signin');
  }
} 