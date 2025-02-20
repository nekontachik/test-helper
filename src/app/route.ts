import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import logger from '@/lib/utils/logger';

export async function GET() {
  const requestId = crypto.randomUUID();
  logger.debug({ requestId }, '[ROOT] Handling root route request');

  try {
    const session = await getServerSession(authOptions);
    logger.debug({ 
      requestId, 
      hasSession: !!session 
    }, '[ROOT] Session check');

    if (!session) {
      logger.info({ requestId }, '[ROOT] No session found, redirecting to signin');
      redirect('/auth/signin');
    }

    logger.info({ 
      requestId,
      userId: session.user.id 
    }, '[ROOT] Session found, redirecting to dashboard');
    redirect('/dashboard');
  } catch (error) {
    logger.error({ 
      requestId,
      error 
    }, '[ROOT] Error handling root route');
    redirect('/auth/signin');
  }
} 