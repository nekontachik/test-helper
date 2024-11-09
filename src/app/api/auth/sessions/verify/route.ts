import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SessionService } from '@/lib/auth/sessionService';
import { z } from 'zod';

const verifySchema = z.object({
  sessionId: z.string().min(1),
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
    const { sessionId } = verifySchema.parse(body);

    const isValid = await SessionService.validateSession(sessionId);

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Update session activity
    await SessionService.updateSessionActivity(sessionId);

    return NextResponse.json({
      valid: true,
      message: 'Session is valid',
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { message: 'Failed to verify session' },
      { status: 500 }
    );
  }
}
