import { authenticator } from 'otplib';
import { prisma } from '@/lib/prisma';
import { AuditService } from '../audit/auditService';
import { AuditAction, AuditLogType } from '@/types/audit';
import type { Prisma } from '@prisma/client';

export class TwoFactorService {
  static async verifyTOTP(userId: string, token: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true },
    });

    if (!user?.twoFactorSecret) {
      return false;
    }

    return authenticator.verify({
      token,
      secret: user.twoFactorSecret,
    });
  }

  static async validateSession(sessionId: string): Promise<boolean> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { 
        expiresAt: true,
        deviceInfo: true,
      },
    });

    if (!session) return false;

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      return false;
    }

    // Check if device is trusted
    const deviceInfo = session.deviceInfo ? JSON.parse(session.deviceInfo) : null;
    return !!deviceInfo?.verified;
  }

  static async markSessionVerified(sessionId: string, userId: string, ip?: string, userAgent?: string): Promise<void> {
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        deviceInfo: JSON.stringify({
          verified: true,
          verifiedAt: new Date().toISOString(),
        }),
      },
    });

    // Log successful 2FA verification
    await AuditService.log({
      userId,
      type: AuditLogType.SECURITY,
      action: AuditAction.TWO_FACTOR_VERIFY,
      metadata: {
        sessionId,
        event: '2fa_verification_success',
        ip,
        userAgent,
      },
    });
  }

  static async enableTwoFactor(userId: string): Promise<string> {
    const secret = authenticator.generateSecret();
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
      },
    });

    await AuditService.log({
      userId,
      type: AuditLogType.SECURITY,
      action: AuditAction.TWO_FACTOR_ENABLE,
      metadata: {
        event: '2fa_enabled',
      },
    });

    return secret;
  }

  static async disableTwoFactor(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    await AuditService.log({
      userId,
      type: AuditLogType.SECURITY,
      action: AuditAction.TWO_FACTOR_DISABLE,
      metadata: {
        event: '2fa_disabled',
      },
    });
  }
} 