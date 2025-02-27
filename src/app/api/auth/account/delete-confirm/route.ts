import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SecurityService } from '@/lib/auth/securityService';
import { z } from 'zod';

const confirmSchema = z.object({
  password: z.string().min(1),
  confirmPhrase: z.literal('DELETE')
});

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'ERROR_CODE', 401);
    }

    const body = await _req.json();
    const { password, confirmPhrase } = confirmSchema.parse(body);

    // Verify password
    const isValid = await SecurityService.verifyPassword(
      session.user.id,
      password
    );

    if (!isValid) {
      return createErrorResponse('Invalid password', 'ERROR_CODE', 400);
    }

    // Verify confirmation phrase
    if (confirmPhrase !== 'DELETE') {
      return createErrorResponse('Invalid confirmation phrase', 'ERROR_CODE', 400);
    }

    // Delete all user data
    await prisma.$transaction([
      prisma.session.deleteMany({
        where: { userId: session.user.id }
      }),
      prisma.user.delete({
        where: { id: session.user.id }
      }),
    ]);

    return createSuccessResponse({
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    return createErrorResponse('Failed to delete account', 'ERROR_CODE', 500);
  }
}
