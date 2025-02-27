import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { BackupCodesService } from '@/lib/auth/backupCodesService';

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 401); }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorEnabled: true } });

    if (!user?.twoFactorEnabled) {
      return createErrorResponse('2FA must be enabled to generate backup codes', 400); }

    const backupCodes = await BackupCodesService.generateCodes(session.user.id);

    return createSuccessResponse({ backupCodes }); } catch (error) {
    console.error('Backup codes generation error:', error);
    return createErrorResponse('Failed to generate backup codes'); }
}
