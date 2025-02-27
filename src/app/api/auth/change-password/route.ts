import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SecurityService } from '@/lib/auth/securityService';
import { z } from 'zod';
import logger from '@/lib/logger';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6)
});

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'ERROR_CODE', 401);
    }

    const body = await _req.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }
    });

    if (!user?.password) {
      return createErrorResponse('User not found', 'ERROR_CODE', 404);
    }

    const isValid = await SecurityService.verifyPassword(currentPassword, user.password);

    if (!isValid) {
      logger.warn('Invalid password attempt during password change', {
        userId: session.user.id
      });
      return createErrorResponse('Current password is incorrect', 'ERROR_CODE', 400);
    }

    const hashedPassword = await SecurityService.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    });

    logger.info('Password changed successfully', {
      userId: session.user.id
    });

    return createSuccessResponse({
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    return createErrorResponse('Failed to change password', 'ERROR_CODE', 500);
  }
}
