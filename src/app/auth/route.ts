import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import logger from '@/lib/utils/logger';

// Set to true to bypass authentication in development
const DEV_MODE = true;

export async function GET(_request: Request): Promise<Response> {
  const requestId = crypto.randomUUID();
  logger.debug(`[AUTH] Processing request: ${requestId}`);

  try {
    // In development mode, bypass authentication and redirect to dashboard
    if (DEV_MODE) {
      logger.info(`[AUTH] Development mode, redirecting to dashboard: ${requestId}`);
      return redirect('/dashboard');
    }

    const session = await getServerSession(authOptions);
    
    if (session) {
      logger.info(`[AUTH] Redirecting authenticated user: ${requestId}, userId: ${session.user.id}`);
      return redirect('/dashboard');
    }

    logger.info(`[AUTH] Redirecting to login: ${requestId}`);
    return redirect('/auth/login');
  } catch (error) {
    logger.error(`[AUTH] Error in auth route: ${requestId}, error: ${error instanceof Error ? error.message : String(error)}`);
    return redirect('/auth/login');
  }
} 