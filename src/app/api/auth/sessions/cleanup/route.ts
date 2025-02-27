import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { SessionTrackingService } from '@/lib/auth/sessionTrackingService';

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    // Verify that the request comes from a cron job or authorized source
    const authHeader = _req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return createSuccessResponse({ error: 'Unauthorized' }, { status: 401 }; }

    await SessionTrackingService.cleanupExpiredSessions();

    return createSuccessResponse({
      message: 'Session cleanup completed' }; } catch (error) {
    console.error('Session cleanup error:', error);
    return createSuccessResponse({ error: 'Failed to cleanup sessions' }, { status: 500 }; }
}
