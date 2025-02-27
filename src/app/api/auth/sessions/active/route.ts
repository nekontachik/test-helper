import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SessionService } from '@/lib/auth/sessionService';

export async function GET(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'ERROR_CODE', 401); }

    const currentSessionId = _req.headers.get('x-session-id');
    const activeSessions = await SessionService.getUserSessions(session.user.id);

    const formattedSessions = activeSessions.map(s => ({
      id: s.id,
      lastActive: s.lastActive,
      isCurrent: s.id === currentSessionId,
      deviceInfo: s.deviceInfo,
      createdAt: s.createdAt }));

    return NextResponse.json(formattedSessions); } catch (error) {
    console.error('Active sessions fetch error:', error);
    return createErrorResponse('Failed to fetch active sessions', 'ERROR_CODE', 500); }
}
