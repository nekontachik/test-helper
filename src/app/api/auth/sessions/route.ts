import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SessionService } from '@/lib/auth/sessionService';

interface SessionData {
  id: string;
  userAgent: string | null;
  lastActive: Date;
  deviceInfo: Record<string, unknown> | null;
}

export async function GET(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED'); }

    const sessions = await SessionService.getUserSessions(session.user.id);

    return createSuccessResponse({
      sessions: sessions.map((session: SessionData) => ({
        id: session.id,
        userAgent: session.userAgent,
        lastActive: session.lastActive,
        deviceInfo: session.deviceInfo })) }); } catch (error) {
    console.error('Session fetch error:', error);
    return createErrorResponse('Failed to fetch sessions', 'INTERNAL_ERROR'); }
}

export async function DELETE(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED'); }

    const currentSessionToken = _req.headers.get('x-session-token') || undefined;

    await SessionService.terminateAllSessions(session.user.id, currentSessionToken);

    return createSuccessResponse({
      message: 'All other sessions terminated' }); } catch (error) {
    console.error('Session termination error:', error);
    return createErrorResponse('Failed to terminate sessions', 'INTERNAL_ERROR'); }
}
