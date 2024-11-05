import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { SessionService } from '@/lib/auth/sessionService';

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

    // Don't allow terminating current session
    if (params.sessionId === session.id) {
      return NextResponse.json(
        { error: 'Cannot terminate current session' },
        { status: 400 }
      );
    }

    await SessionService.terminateSession(params.sessionId, session.user.id);

    return NextResponse.json({
      message: 'Session terminated',
    });
  } catch (error) {
    console.error('Session termination error:', error);
    return NextResponse.json(
      { error: 'Failed to terminate session' },
      { status: 500 }
    );
  }
}
