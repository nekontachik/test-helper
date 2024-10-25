import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const currentSessionId = request.headers.get('x-session-id');
    
    // Prevent terminating current session
    if (params.sessionId === currentSessionId) {
      return NextResponse.json(
        { message: 'Cannot terminate current session' },
        { status: 400 }
      );
    }

    // Verify session belongs to user
    const targetSession = await prisma.session.findUnique({
      where: { id: params.sessionId },
      select: { userId: true },
    });

    if (!targetSession || targetSession.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Session not found' },
        { status: 404 }
      );
    }

    await prisma.session.delete({
      where: { id: params.sessionId },
    });

    return NextResponse.json({
      message: 'Session terminated successfully',
    });
  } catch (error) {
    console.error('Session termination error:', error);
    return NextResponse.json(
      { message: 'Failed to terminate session' },
      { status: 500 }
    );
  }
}
