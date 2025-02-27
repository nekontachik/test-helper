import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { SecurityService } from '@/lib/auth/securityService';
import { ActivityService } from '@/lib/auth/activityService';
import { sendPasswordResetEmail } from '@/lib/utils/email';
import { generateToken } from '@/lib/utils/token';
import logger from '@/lib/logger';
import { ActivityEventType } from '@/types/activity';

const requestSchema = z.object({
  email: z.string().email() });

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const { email } = requestSchema.parse(await _req.json());
    const ip = _req.headers.get('x-forwarded-for') || 'anonymous';
    const userAgent = _req.headers.get('user-agent') || undefined;

    // Check rate limit
    await SecurityService.checkBruteForce(ip, 'password');

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true } });

    if (user) {
      const token = await generateToken();
      const expires = new Date(Date.now() + 3600000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: token,
          resetTokenExpiry: expires, } });

      await sendPasswordResetEmail(user.email, user.name || 'User', token);
      await ActivityService.log(user.id, ActivityEventType.PASSWORD_RESET_REQUESTED, {
        ip,
        userAgent });

      logger.info('Password reset requested', { userId: user.id, ip }); }

    // Always return success to prevent email enumeration
    return createSuccessResponse({
      message: 'If an account exists, a password reset link has been sent.' }; } catch (error) {
    logger.error('Password reset request error:', error);
    return createSuccessResponse({ error: 'Failed to process request' }, { status: 500 }; }
}
