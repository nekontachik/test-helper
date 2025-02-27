import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SecurityService } from '@/lib/auth/securityService';
import logger from '@/lib/logger';

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'ERROR_CODE', 401); }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorEnabled: true } });

    if (!user?.twoFactorEnabled) {
      return createErrorResponse('2FA must be enabled to generate backup codes', 'ERROR_CODE', 400); }

    // First, delete existing backup codes
    await prisma.backupCode.deleteMany({
      where: { userId: session.user.id } });

    // Generate and store new backup codes
    const codes = await SecurityService.generateBackupCodes();
    const hashedCodes = await SecurityService.hashBackupCodes(codes);

    // Create new backup codes
    await prisma.backupCode.createMany({
      data: hashedCodes.map((hashedCode: string) => ({
        userId: session.user.id,
        code: hashedCode,
        used: false })) });

    logger.info('Generated new backup codes', { 
      userId: session.user.id,
      count: codes.length });

    return createSuccessResponse({ codes }; } catch (error) {
    logger.error('Backup codes generation error:', error);
    return createErrorResponse('Failed to generate backup codes', 'ERROR_CODE', 500); }
}
