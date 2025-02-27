import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/emailService';
import { TokenService } from '@/lib/auth/tokenService';

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'ERROR_CODE', 401); }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true, email: true, name: true } });

    if (!user) {
      return createErrorResponse('User not found', 'ERROR_CODE', 404); }

    if (user.emailVerified) {
      return createErrorResponse('Email already verified', 'ERROR_CODE', 400); }

    // Generate new verification token
    const token = await TokenService.generateEmailVerificationToken(user.email);
    await sendVerificationEmail(user.email, user.name || 'User');

    return createSuccessResponse({
      message: 'Verification email sent successfully' }; } catch (error) {
    console.error('Email verification resend error:', error);
    return createErrorResponse('Failed to resend verification email', 'ERROR_CODE', 500); }
}
