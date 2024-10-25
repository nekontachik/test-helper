import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SessionService } from '@/lib/auth/sessionService';
import { z } from 'zod';

const revokeSchema = z.object({
  sessionIds: z.array(z.string()),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionIds } = revokeSchema.parse(body);

    // Verify all sessions belong to user
    const sessions = await SessionService.getUserSessions(session.user.id);
    const userSessionIds = sessions.map(s => s.id);
    const invalidSessionIds = sessionIds.filter(id => !userSessionIds.includes(id));

    if (invalidSessionIds.length > 0) {
      return NextResponse.json(
        { message: 'Invalid session IDs' },
        { status: 400 }
      );
    }

    // Revoke sessions
    await Promise.all(
      sessionIds.map(id => SessionService.terminateSession(id, session.user.id))
    );

    return NextResponse.json({
      message: 'Sessions revoked successfully',
    });
  } catch (error) {
    console.error('Session revocation error:', error);
    return NextResponse.json(
      { message: 'Failed to revoke sessions' },
      { status: 500 }
    );
  }
}
