import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { TokenService, TokenType } from '@/lib/auth/tokens/tokenService';
import { sendPasswordResetEmail } from '@/lib/emailService';
import { z } from 'zod';
import logger from '@/lib/logger';

const emailSchema = z.object({
  email: z.string().email()
});

export async function POST(request: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const body = await request.json();
    const { email } = emailSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true }
    });

    if (!user) {
      // Return success even if user doesn't exist for security
      return createSuccessResponse({
        message: 'If an account exists, a password reset link has been sent.'
      });
    }

    const token = await TokenService.generateToken({
      type: TokenType.PASSWORD_RESET,
      userId: user.id,
      email: user.email
    });

    await sendPasswordResetEmail(user.email, user.name || 'User', token);

    logger.info('Password reset requested', { userId: user.id });

    return createSuccessResponse({
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    logger.error('Password reset error:', error);
    return createErrorResponse('Failed to process password reset request', 'ERROR_CODE', 500);
  }
}
