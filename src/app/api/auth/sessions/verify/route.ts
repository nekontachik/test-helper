import { type NextRequest, NextResponse } from 'next/server';
import { createErrorResponse } from '@/types/api';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SessionService } from '@/lib/auth/sessionService';
import { z } from 'zod';

const verifySchema = z.object({
  sessionId: z.string().min(1)
});

export async function POST(_req: NextRequest): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'ERROR_CODE', 401),
        { status: 401 }
      );
    }

    const body = await _req.json();
    const { sessionId } = verifySchema.parse(body);

    const isValid = await SessionService.validateSession(sessionId);

    if (!isValid) {
      return NextResponse.json(
        createErrorResponse('Invalid or expired session', 'ERROR_CODE', 401),
        { status: 401 }
      );
    }

    // Update session activity
    await SessionService.updateSessionActivity(sessionId);

    return NextResponse.json({
      valid: true,
      message: 'Session is valid'
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to verify session', 'ERROR_CODE', 500),
      { status: 500 }
    );
  }
}
