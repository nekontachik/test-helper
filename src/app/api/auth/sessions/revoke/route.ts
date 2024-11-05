import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ActivityService } from '@/lib/auth/activityService';
import { authOptions } from '../../[...nextauth]/route';

const revokeSchema = z.object({
  sessionIds: z.array(z.string()),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { sessionIds } = revokeSchema.parse(await request.json());
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const userAgent = request.headers.get('user-agent');

    // Verify ownership of sessions
    const sessions = await prisma.session.findMany({
      where: {
        id: { in: sessionIds },
        userId: session.user.id,
      },
    });

    if (sessions.length !== sessionIds.length) {
      return NextResponse.json(
        { error: 'Invalid session IDs' },
        { status: 400 }
      );
    }

    // Revoke sessions
    await prisma.session.deleteMany({
      where: {
        id: { in: sessionIds },
        userId: session.user.id,
      },
    });

    await ActivityService.log(session.user.id, 'SESSIONS_REVOKED', {
      ip,
      userAgent,
      metadata: { sessionIds },
    });

    return NextResponse.json({
      message: 'Sessions revoked successfully',
      count: sessions.length,
    });
  } catch (error) {
    console.error('Session revocation error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke sessions' },
      { status: 500 }
    );
  }
}
