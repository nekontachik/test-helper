import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TokenService } from '@/lib/auth/tokenService';
import { sendRecoveryEmail } from '@/lib/emailService';
import { z } from 'zod';
import { ActivityService } from '@/lib/auth/activityService';
import { ActivityEventType } from '@/types/activity';
import { TokenType } from '@/types/token';
import logger from '@/lib/logger';

const recoverySchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = recoverySchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      // Return success even if user doesn't exist (security)
      return NextResponse.json({
        message: 'If an account exists, recovery instructions have been sent.',
      });
    }

    const token = await TokenService.generateToken({
      type: TokenType.EMAIL_VERIFICATION,
      userId: user.id,
      email: user.email
    });

    await sendRecoveryEmail(user.email, user.name || 'User', token);

    await ActivityService.log(user.id, ActivityEventType.ACCOUNT_RECOVERY_REQUESTED, {
      metadata: {
        email: user.email
      }
    });

    return NextResponse.json({
      message: 'Recovery instructions sent successfully',
    });
  } catch (error) {
    logger.error('Account recovery error:', error);
    return NextResponse.json(
      { message: 'Failed to process recovery request' },
      { status: 500 }
    );
  }
}
