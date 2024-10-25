import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete expired sessions
    const result = await prisma.session.deleteMany({
      where: {
        userId: session.user.id,
        expires: {
          lt: new Date(),
        },
      },
    });

    return NextResponse.json({
      message: `Cleaned up ${result.count} expired sessions`,
    });
  } catch (error) {
    console.error('Session cleanup error:', error);
    return NextResponse.json(
      { message: 'Failed to cleanup sessions' },
      { status: 500 }
    );
  }
}
