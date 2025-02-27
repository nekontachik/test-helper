import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma as _prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { TwoFactorService } from '@/lib/auth/twoFactorService';
import { z } from 'zod';

const validateSchema = z.object({
  code: z.string().length(6) });

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'ERROR_CODE', 401); }

    const body = await _req.json();
    const { code } = validateSchema.parse(body);

    const isValid = await TwoFactorService.verifyTOTP(session.user.id, code);

    if (!isValid) {
      return createErrorResponse('Invalid code', 'ERROR_CODE', 400); }

    return createSuccessResponse({
      message: 'Code validated successfully' 
    }); 
  } catch (error) {
    console.error('2FA validation error:', error);
    return createErrorResponse('Failed to validate code', 'ERROR_CODE', 500); 
  }
}
