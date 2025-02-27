import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { BackupCodesService } from '@/lib/auth/backupCodesService';
import { z } from 'zod';

const recoverySchema = z.object({
  code: z.string().length(8) });

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'ERROR_CODE', 401); }

    const body = await _req.json();
    const { code } = recoverySchema.parse(body);

    const isValid = await BackupCodesService.verifyCode(session.user.id, code);

    if (!isValid) {
      return createErrorResponse('Invalid recovery code', 'ERROR_CODE', 400); }

    // Generate new backup codes after successful recovery
    const newBackupCodes = await BackupCodesService.generateCodes(session.user.id);

    return createSuccessResponse({
      message: 'Recovery successful',
      backupCodes: newBackupCodes }; } catch (error) {
    console.error('2FA recovery error:', error);
    return createErrorResponse('Failed to process recovery', 'ERROR_CODE', 500); }
}
