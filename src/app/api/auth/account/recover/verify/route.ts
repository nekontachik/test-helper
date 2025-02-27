import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { TokenService } from '@/lib/auth/tokenService';
import { SecurityService } from '@/lib/auth/securityService';
import { z } from 'zod';

const verifySchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(6)
});

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const body = await _req.json();
    const { token, newPassword } = verifySchema.parse(body);

    const user = await TokenService.validatePasswordResetToken(token);

    if (!user) {
      return createErrorResponse('Invalid or expired recovery token', 'ERROR_CODE', 400);
    }

    // Update password and clear recovery token
    const hashedPassword = await SecurityService.hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return createSuccessResponse({
      message: 'Account recovered successfully'
    });
  } catch (error) {
    console.error('Account recovery verification error:', error);
    return createErrorResponse('Failed to recover account', 'ERROR_CODE', 500);
  }
}
