import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import logger from '@/lib/utils/logger';

// Set to true to bypass authentication in development
const DEV_MODE = true;

export async function GET(): Promise<never> {
  const requestId = crypto.randomUUID();
  logger.debug('[ROOT] Handling root route request', { requestId });

  try {
    // In development mode, bypass authentication and redirect to dashboard
    if (DEV_MODE) {
      logger.info('[ROOT] Development mode, redirecting to dashboard', { requestId });
      redirect('/dashboard');
    }

    const session = await getServerSession(authOptions);
    logger.debug('[ROOT] Session check', { 
      requestId, 
      hasSession: !!session 
    });

    if (!session) {
      logger.info('[ROOT] No session found, redirecting to login', { requestId });
      redirect('/auth/login');
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
    redirect('/auth/login');
  }
} 