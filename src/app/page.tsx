import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import logger from '@/lib/utils/logger';

// Set to true to bypass authentication in development
const DEV_MODE = true;

export default async function HomePage(): Promise<never> {
  const requestId = crypto.randomUUID();
  logger.debug('[ROOT] Rendering HomePage', { requestId });

  try {
    // In development mode, bypass authentication and redirect to dashboard
    if (DEV_MODE) {
      logger.info('[ROOT] Development mode, redirecting to dashboard', { requestId });
      return redirect('/dashboard');
    }

    const session = await getServerSession(authOptions);
    
    if (!session) {
      logger.info('[ROOT] No session, redirecting to login', { requestId });
      return redirect('/auth/login');
    }

    logger.info('[ROOT] Session found', { requestId, userId: session.user.id });
    return redirect('/dashboard');
    
  } catch (error) {
    logger.error('[ROOT] Error in HomePage', { requestId, error });
    return redirect('/auth/login');
  }
}
