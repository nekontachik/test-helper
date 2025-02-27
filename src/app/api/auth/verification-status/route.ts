import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const emailSchema = z.object({
  email: z.string().email()
});

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const body = await _req.json();
    const { email } = emailSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true }
    });

    if (!user) {
      return createErrorResponse('User not found', 'ERROR_CODE', 404);
    }

    return createSuccessResponse({ isVerified: !!user.emailVerified });
  } catch (error) {
    console.error('Verification status check error:', error);
    return createErrorResponse('Failed to check verification status', 'ERROR_CODE', 500);
  }
}
