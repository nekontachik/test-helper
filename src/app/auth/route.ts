import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import logger from '@/lib/utils/logger';

export async function GET(_request: Request): Promise<Response> {
  const requestId = crypto.randomUUID();
  logger.debug(`[AUTH] Processing request: ${requestId}`);

  try {
    const session = await getServerSession(authOptions);
    
    if (session) {
      logger.info(`[AUTH] Redirecting authenticated user: ${requestId}, userId: ${session.user.id}`);
      return redirect('/dashboard');
    }

    logger.info(`[AUTH] Redirecting to signin: ${requestId}`);
    return redirect('/auth/signin');
  } catch (error) {
    logger.error(`[AUTH] Error in auth route: ${requestId}, error: ${error instanceof Error ? error.message : String(error)}`);
    return redirect('/auth/signin');
  }
} 