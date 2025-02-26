import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import logger from '@/lib/utils/logger';

export default async function HomePage(): Promise<never> {
  const requestId = crypto.randomUUID();
  logger.debug('[ROOT] Rendering HomePage', { requestId });

  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      logger.info('[ROOT] No session, redirecting to signin', { requestId });
      return redirect('/auth/signin');
    }

    logger.info('[ROOT] Session found', { requestId, userId: session.user.id });
    return redirect('/dashboard');
    
  } catch (error) {
    logger.error('[ROOT] Error in HomePage', { requestId, error });
    return redirect('/auth/signin');
  }
}
