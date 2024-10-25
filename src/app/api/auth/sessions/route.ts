import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { UAParser } from 'ua-parser-js';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const sessions = await prisma.session.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        lastActive: 'desc',
      },
    });

    const currentSessionId = request.headers.get('x-session-id');

    const parser = new UAParser();
    const formattedSessions = sessions.map(s => {
      parser.setUA(s.userAgent || '');
      const device = parser.getResult();

      return {
        id: s.id,
        userAgent: `${device.browser.name} on ${device.os.name}`,
        lastActive: s.lastActive,
        isCurrent: s.id === currentSessionId,
      };
    });

    return NextResponse.json(formattedSessions);
  } catch (error) {
    console.error('Sessions fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const currentSessionId = request.headers.get('x-session-id');

    await prisma.session.deleteMany({
      where: {
        userId: session.user.id,
        NOT: {
          id: currentSessionId,
        },
      },
    });

    return NextResponse.json({
      message: 'All other sessions terminated successfully',
    });
  } catch (error) {
    console.error('Sessions termination error:', error);
    return NextResponse.json(
      { message: 'Failed to terminate sessions' },
      { status: 500 }
    );
  }
}
