import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'ERROR_CODE', 401); }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorEnabled: true, emailVerified: true } });

    if (!user?.emailVerified) {
      return createErrorResponse('Email must be verified to enable 2FA', 'ERROR_CODE', 400); }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: !user.twoFactorEnabled },
      select: { twoFactorEnabled: true } });

    return createSuccessResponse({
      twoFactorEnabled: updatedUser.twoFactorEnabled }; } catch (error) {
    console.error('2FA toggle error:', error);
    return createErrorResponse('Failed to toggle 2FA', 'ERROR_CODE', 500); }
}
