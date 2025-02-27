import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SessionService } from '@/lib/auth/sessionService';

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'ERROR_CODE', 401); }

    // Clean up expired sessions
    const result = await SessionService.cleanupExpiredSessions();

    return createSuccessResponse({
      message: `Cleaned up ${result.count} expired sessions`,
      count: result.count
    });
  } catch (error) {
    console.error('Session cleanup error:', error);
    return createErrorResponse('Failed to cleanup sessions', 'ERROR_CODE', 500);
  }
}
