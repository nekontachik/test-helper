import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPasswordResetToken } from '@/lib/auth/tokens';
import { SecurityService } from '@/lib/auth/securityService';
import { AUTH_ERRORS } from '@/lib/utils/error';
import logger from '@/lib/logger';

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8)
});

export async function POST(request: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const body = await request.json();
    const { token, password } = resetSchema.parse(body);

    const user = await verifyPasswordResetToken(token);
    if (!user) {
      return createErrorResponse(AUTH_ERRORS.INVALID_TOKEN, 'INVALID_TOKEN', 400);
    }

    // Check if password has been breached
    const isBreached = await SecurityService.checkPasswordBreached(password);
    if (isBreached) {
      return createErrorResponse(AUTH_ERRORS.PASSWORD_COMPROMISED, 'PASSWORD_COMPROMISED', 400);
    }

    const hashedPassword = await SecurityService.hashPassword(password);

    await prisma.user.update({
      where: { email: user.email },
      data: { 
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    logger.info('Password reset successful', { userId: user.id });
    return createSuccessResponse({
      message: 'Password reset successfully'
    });
  } catch (error) {
    logger.error('Password reset error:', error);
    return createErrorResponse(AUTH_ERRORS.UNKNOWN, 'UNKNOWN_ERROR', 500);
  }
}

export async function PUT(_request: NextRequest): Promise<ApiResponse<unknown>> {
  // Complete password reset
  return createErrorResponse('Not implemented', 'NOT_IMPLEMENTED', 501);
}
