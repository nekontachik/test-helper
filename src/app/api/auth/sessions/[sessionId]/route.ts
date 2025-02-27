import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { SessionService } from '@/lib/auth/sessionService';
import logger from '@/lib/logger';

interface RouteParams {
  params: {
    sessionId: string; }; }

export async function DELETE(
  _req: NextRequest,
  { params }: RouteParams
): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'ERROR_CODE', 401);
    }

    // Get current session from database
    const currentSession = await prisma.session.findFirst({
      where: {
        userId: session.user.id,
        // Use AND to ensure we get the active session
        AND: {
          expiresAt: {
            gt: new Date() } } },
      orderBy: {
        lastActive: 'desc' } });

    // Don't allow terminating current session
    if (params.sessionId === currentSession?.id) {
      return createErrorResponse('Cannot terminate current session', 'ERROR_CODE', 400);
    }

    await SessionService.terminateSession(params.sessionId, session.user.id);

    logger.info('Session terminated', { 
      sessionId: params.sessionId, 
      userId: session.user.id });

    return createSuccessResponse({
      message: 'Session terminated'
    });
  } catch (error) {
    logger.error('Session termination error:', error);
    return createErrorResponse('Failed to terminate session', 'ERROR_CODE', 500);
  }
}
