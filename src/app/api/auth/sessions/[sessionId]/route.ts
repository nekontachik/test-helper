import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { SessionService } from '@/lib/auth/sessionService';
import logger from '@/lib/logger';

interface RouteParams {
  params: {
    sessionId: string;
  };
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current session from database
    const currentSession = await prisma.session.findFirst({
      where: {
        userId: session.user.id,
        // Use AND to ensure we get the active session
        AND: {
          expiresAt: {
            gt: new Date()
          }
        }
      },
      orderBy: {
        lastActive: 'desc'
      }
    });

    // Don't allow terminating current session
    if (params.sessionId === currentSession?.id) {
      return NextResponse.json(
        { error: 'Cannot terminate current session' },
        { status: 400 }
      );
    }

    await SessionService.terminateSession(params.sessionId, session.user.id);

    logger.info('Session terminated', { 
      sessionId: params.sessionId, 
      userId: session.user.id 
    });

    return NextResponse.json({
      message: 'Session terminated',
    });
  } catch (error) {
    logger.error('Session termination error:', error);
    return NextResponse.json(
      { error: 'Failed to terminate session' },
      { status: 500 }
    );
  }
}
