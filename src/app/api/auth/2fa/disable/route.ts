import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { TwoFactorService } from '@/lib/auth/twoFactorService';
import { z } from 'zod';

const disableSchema = z.object({
  code: z.string().length(6) });

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'ERROR_CODE', 401); }

    const body = await _req.json();
    const { code } = disableSchema.parse(body);

    const isValid = await TwoFactorService.verifyTOTP(session.user.id, code);

    if (!isValid) {
      return createErrorResponse('Invalid verification code', 'ERROR_CODE', 400); }

    // First delete all backup codes
    await prisma.backupCode.deleteMany({
      where: { userId: session.user.id } });

    // Then update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null, } });

    return createSuccessResponse({
      message: '2FA disabled successfully' 
    }); 
  } catch (error) {
    console.error('2FA disable error:', error);
    return createErrorResponse('Failed to disable 2FA', 'ERROR_CODE', 500); 
  }
}
