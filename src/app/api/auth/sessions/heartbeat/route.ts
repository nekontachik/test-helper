import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SessionManager } from '@/lib/auth/session/sessionManager';

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createSuccessResponse({ error: 'Unauthorized' }, { status: 401 }; }

    await SessionManager.updateSessionActivity(session.user.id);

    return createSuccessResponse({
      message: 'Session activity updated' }; } catch (error) {
    console.error('Session heartbeat error:', error);
    return createSuccessResponse({ error: 'Failed to update session activity' }, { status: 500 }; }
}
