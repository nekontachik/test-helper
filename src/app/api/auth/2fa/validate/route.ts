import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { TwoFactorService } from '@/lib/auth/twoFactorService';
import { checkRateLimit } from '@/lib/auth/rateLimit';
import { z } from 'zod';

const validateSchema = z.object({
  code: z.string().length(6) });

interface SessionDeviceInfo {
  twoFactorAuthenticated?: boolean;
  twoFactorAuthenticatedAt?: string;
  deviceId?: string;
  lastActivity?: string; }

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    // Check rate limit
    const ip = _req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(`2fa_validate_${ip}`);

    if (!rateLimitResult.success) {
      return createErrorResponse('Too many attempts. Please try again later.', 'ERROR_CODE', 429); }

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'ERROR_CODE', 401); }

    const body = await _req.json();
    const { code } = validateSchema.parse(body);

    const isValid = await TwoFactorService.verifyTOTP(session.user.id, code);

    if (!isValid) {
      return createErrorResponse('Invalid code', 'ERROR_CODE', 400); }

    // Get existing deviceInfo or create new
    const sessionId = _req.headers.get('x-session-id');
    const existingSession = sessionId ? await prisma.session.findUnique({
      where: { id: sessionId },
      select: { deviceInfo: true } }) : null;

    const existingDeviceInfo: SessionDeviceInfo = existingSession?.deviceInfo 
      ? JSON.parse(existingSession.deviceInfo)
      : {};

    // Update session with deviceInfo
    await prisma.session.update({
      where: { 
        id: sessionId || undefined,
        userId: session.user.id, },
      data: { 
        lastActive: new Date(),
        deviceInfo: JSON.stringify({
          ...existingDeviceInfo,
          twoFactorAuthenticated: true,
          twoFactorAuthenticatedAt: new Date().toISOString(),
          deviceId: _req.headers.get('x-device-id') || undefined,
          lastActivity: new Date().toISOString() }) } });

    return createSuccessResponse({
      message: 'Code validated successfully' 
    }); 
  } catch (error) {
    console.error('2FA validation error:', error);
    
    if (error instanceof z.ZodError) {
      return createErrorResponse('Invalid code format', 'ERROR_CODE', 400); }

    return createErrorResponse('Failed to validate code', 'ERROR_CODE', 500); 
  }
}
