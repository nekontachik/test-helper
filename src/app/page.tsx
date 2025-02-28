import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verify, type JwtPayload } from 'jsonwebtoken';
import logger from '@/lib/utils/logger';

// Define the token payload interface
interface TokenPayload extends JwtPayload {
  id: string;
  email: string;
  role?: string;
}

export default async function HomePage(): Promise<never> {
  const requestId = crypto.randomUUID();
  logger.debug('[ROOT] Rendering HomePage', { requestId });

  try {
    // Get the token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('session-token')?.value;
    
    if (!token) {
      logger.info('[ROOT] No session token found, redirecting to signin', { requestId });
      return redirect('/auth/signin');
    }
    
    try {
      // Verify the token
      const decoded = verify(
        token, 
        process.env.NEXTAUTH_SECRET || 'a-very-secure-secret-for-development-only'
      ) as TokenPayload;
      
      logger.info('[ROOT] Session found', { requestId, userId: decoded.id });
      return redirect('/dashboard');
    } catch (error) {
      logger.error('[ROOT] Invalid session token', { 
        requestId, 
        error: error instanceof Error ? error.message : String(error) 
      });
      return redirect('/auth/signin');
    }
  } catch (error) {
    logger.error('[ROOT] Error in HomePage', { 
      requestId, 
      error: error instanceof Error ? error.message : String(error) 
    });
    return redirect('/auth/signin');
  }
}
