import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ActivityService } from '@/lib/auth/activityService';
import { authOptions } from '@/lib/auth';
import { ActivityEventType } from '@/types/activity';

const revokeSchema = z.object({
  sessionIds: z.array(z.string())
});

export async function POST(_req: NextRequest): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { sessionIds } = revokeSchema.parse(await _req.json());
    const ip = _req.headers.get('x-forwarded-for') || undefined;
    const userAgent = _req.headers.get('user-agent') || undefined;

    // Verify ownership of sessions
    const sessions = await prisma.session.findMany({
      where: {
        id: { in: sessionIds },
        userId: session.user.id
      }
    });

    if (sessions.length !== sessionIds.length) {
      return NextResponse.json(
        { success: false, error: 'Invalid session IDs' },
        { status: 400 }
      );
    }

    // Revoke sessions
    await prisma.session.deleteMany({
      where: {
        id: { in: sessionIds },
        userId: session.user.id
      }
    });

    await ActivityService.log(session.user.id, ActivityEventType.SESSION_REVOKED, {
      ip,
      userAgent,
      metadata: { sessionIds }
    });

    return NextResponse.json({
      success: true,
      message: 'Sessions revoked successfully',
      count: sessions.length
    });
  } catch (error) {
    console.error('Session revocation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to revoke sessions' },
      { status: 500 }
    );
  }
}
