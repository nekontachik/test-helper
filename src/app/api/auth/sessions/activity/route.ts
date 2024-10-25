import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { checkRateLimit } from '@/lib/auth/rateLimit';
import { UAParser } from 'ua-parser-js';

export async function GET(request: Request) {
  try {
    // Check rate limit
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(`session_activity_${ip}`);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const activities = await prisma.session.findMany({
      where: { userId: session.user.id },
      orderBy: { lastActive: 'desc' },
      take: 10,
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        lastActive: true,
        expires: true,
      },
    });

    const parser = new UAParser();
    const formattedActivities = activities.map(activity => {
      parser.setUA(activity.userAgent || '');
      const device = parser.getResult();

      return {
        ...activity,
        device: {
          browser: device.browser.name,
          os: device.os.name,
          device: device.device.type || 'desktop',
        },
        isExpired: activity.expires < new Date(),
      };
    });

    return NextResponse.json(formattedActivities);
  } catch (error) {
    console.error('Session activity fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch session activity' },
      { status: 500 }
    );
  }
}

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
    const { type, details } = body;

    const activity = await SessionService.logSessionActivity(
      session.user.id,
      type,
      details,
      request.headers.get('user-agent') || undefined,
      request.headers.get('x-forwarded-for') || undefined
    );

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Session activity log error:', error);
    return NextResponse.json(
      { message: 'Failed to log session activity' },
      { status: 500 }
    );
  }
}
