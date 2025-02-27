import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { SessionTrackingService } from '@/lib/auth/sessionTrackingService';

export async function GET(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    await SessionTrackingService.cleanupExpiredSessions();
    
    return createErrorResponse('Session cleanup completed successfully'); } catch (error) {
    console.error('Session cleanup error:', error);
    return createSuccessResponse({ error: 'Failed to cleanup sessions' }, { status: 500 }; }
}
