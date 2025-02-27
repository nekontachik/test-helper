import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import logger from '@/lib/logger';

const securitySettingsSchema = z.object({
  twoFactorEnabled: z.boolean().optional(),
  sessionTimeout: z.number().min(5).max(60).optional(),
  allowMultipleSessions: z.boolean().optional()
});

export async function GET(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'ERROR_CODE', 401);
    }

    const settings = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        twoFactorEnabled: true,
        failedLoginAttempts: true,
        lockedUntil: true,
        emailVerified: true,
        status: true,
      }
    });

    logger.info('Security settings fetched', { userId: session.user.id });
    return createSuccessResponse(settings);
  } catch (error) {
    logger.error('Security settings fetch error:', error);
    return createErrorResponse('Failed to fetch security settings', 'ERROR_CODE', 500);
  }
}

export async function PUT(req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'ERROR_CODE', 401);
    }

    const body = await req.json();
    const settings = securitySettingsSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: settings,
      select: {
        twoFactorEnabled: true,
        updatedAt: true,
      }
    });

    logger.info('Security settings updated', { 
      userId: session.user.id,
      settings
    });

    return createSuccessResponse(updatedUser);
  } catch (error) {
    logger.error('Security settings update error:', error);
    return createErrorResponse('Failed to update security settings', 'ERROR_CODE', 500);
  }
}
