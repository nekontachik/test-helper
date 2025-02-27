import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { verifyTOTP } from '@/lib/utils/totp';
import { authOptions } from '@/lib/auth';
import { AUTH_ERRORS } from '@/lib/utils/error';

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  throw new Error('Not implemented');
}

export async function PUT(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse(AUTH_ERRORS.SESSION_REQUIRED, 'UNAUTHORIZED', 401);
    }

    const { token } = await _req.json();
    if (!token) {
      return createErrorResponse('Verification code is required', 'VALIDATION_ERROR', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorSecret: true }
    });

    if (!user?.twoFactorSecret) {
      return createErrorResponse('2FA setup not initiated', 'VALIDATION_ERROR', 400);
    }

    const isValid = verifyTOTP(token, user.twoFactorSecret);
    if (!isValid) {
      return createErrorResponse('Invalid verification code', 'VALIDATION_ERROR', 400);
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: true }
    });

    return createSuccessResponse({ success: true });
  } catch (error) {
    console.error('2FA verification error:', error);
    return createErrorResponse(AUTH_ERRORS.UNKNOWN, 'INTERNAL_ERROR', 500);
  }
}
