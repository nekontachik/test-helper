import { authenticator } from 'otplib';
import { prisma } from '@/lib/prisma';
import { AuditService, AuditAction } from '../audit/auditService';

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
        twoFactorAuthenticated: true,
        expires: true,
      },
    });

    return session?.twoFactorAuthenticated === true && 
           session.expires > new Date();
  }

  static async markSessionVerified(sessionId: string, userId: string, ip?: string, userAgent?: string) {
    await prisma.session.update({
      where: { id: sessionId },
      data: { twoFactorAuthenticated: true },
    });

    // Log successful 2FA verification
    await AuditService.log({
      userId,
      action: AuditAction.TWO_FACTOR_VERIFY,
      success: true,
      ip,
      userAgent,
      metadata: {
        sessionId,
        event: '2fa_verification_success',
      },
    });
  }
} 