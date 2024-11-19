import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { checkRateLimit } from '@/lib/auth/rateLimit';

export async function GET(request: Request) {
  try {
    // Check rate limit
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(`account_activity_${ip}`);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { message: 'Too many requests' },
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

    // Get user's recent activity using the correct model name
    const activities = await prisma.userActivity.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        details: true,
      },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Activity log error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch activity log' },
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

    // Log new activity using the correct model name
    const activity = await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type,
        details: typeof details === 'string' ? details : JSON.stringify(details),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Activity logging error:', error);
    return NextResponse.json(
      { message: 'Failed to log activity' },
      { status: 500 }
    );
  }
}
