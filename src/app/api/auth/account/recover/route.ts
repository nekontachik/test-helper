import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { TokenService } from '@/lib/auth/tokenService';
import { sendRecoveryEmail } from '@/lib/emailService';
import { z } from 'zod';
import { ActivityService } from '@/lib/auth/activityService';
import { ActivityEventType } from '@/types/activity';
import { TokenType } from '@/types/token';
import logger from '@/lib/logger';

const recoverySchema = z.object({
  email: z.string().email() });

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const body = await _req.json();
    const { email } = recoverySchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true } });

    if (!user) {
      // Return success even if user doesn't exist (security)
      return createSuccessResponse({
        message: 'If an account exists, recovery instructions have been sent.' }; }

    const token = await TokenService.generateToken({
      type: TokenType.EMAIL_VERIFICATION,
      userId: user.id,
      email: user.email });

    await sendRecoveryEmail(user.email, user.name || 'User', token);

    await ActivityService.log(user.id, ActivityEventType.ACCOUNT_RECOVERY_REQUESTED, {
      metadata: {
        email: user.email } });

    return createSuccessResponse({
      message: 'Recovery instructions sent successfully' }; } catch (error) {
    logger.error('Account recovery error:', error);
    return createErrorResponse('Failed to process recovery request', 'ERROR_CODE', 500); }
}
