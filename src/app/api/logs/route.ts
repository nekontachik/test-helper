import { NextResponse } from 'next/server';
import { authUtils } from '@/lib/utils/authUtils';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await authUtils.getSession();
    const body = await req.json();

    const log = await prisma.activityLog.create({
      data: {
        type: 'ERROR',
        action: 'ERROR_BOUNDARY',
        userId: session?.user?.id || 'SYSTEM',
        metadata: JSON.stringify(body),
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        userAgent: req.headers.get('user-agent')
      }
    });

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error('Failed to log error:', error);
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    );
  }
} 