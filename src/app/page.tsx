import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import logger from '@/lib/utils/logger';

export default async function HomePage() {
  const requestId = crypto.randomUUID();
  logger.debug({ requestId }, '[ROOT] Rendering HomePage');

  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      logger.info({ requestId }, '[ROOT] No session, redirecting to signin');
      return redirect('/auth/signin');
    }

    logger.info({ requestId, userId: session.user.id }, '[ROOT] Session found');
    return redirect('/dashboard');
    
  } catch (error) {
    logger.error({ requestId, error }, '[ROOT] Error in HomePage');
    return redirect('/auth/signin');
  }
}
