import { prisma } from '@/lib/prisma';
import { TokenService, TokenType } from './tokens/tokenService';
import { SecurityService } from './securityService';
import { sendPasswordResetEmail } from '../emailService';
import { AuditService, AuditAction } from '../audit/auditService';

export class PasswordResetService {
  static async initiateReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true },
    });

    if (!user) return;

    // Generate reset token using TokenService
    const token = await TokenService.createPasswordResetToken(email);

    // Send reset email
    await sendPasswordResetEmail(email, user.name || 'User', token);

    // Log reset request
    await AuditService.log({
      userId: user.id,
      action: AuditAction.PASSWORD_RESET_REQUEST,
      metadata: {
        email,
        tokenExpiry: '1 hour',
      },
    });
  }

  static async resetPassword(token: string, newPassword: string) {
    const email = await TokenService.verifyPasswordResetToken(token);

    // Check password strength and breaches
    const isBreached = await SecurityService.checkPasswordBreached(newPassword);
    if (isBreached) {
      throw new Error('This password has been exposed in data breaches');
    }

    // Check password history
    const isReused = await SecurityService.checkPasswordHistory(email, newPassword);
    if (isReused) {
      throw new Error('Cannot reuse recent passwords');
    }

    // Hash new password
    const hashedPassword = await SecurityService.hashPassword(newPassword);

    // Update user password
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Add password to history
    await SecurityService.addToPasswordHistory(user.id, hashedPassword);

    // Revoke the reset token
    await TokenService.revokeToken(token, TokenType.PASSWORD_RESET);

    // Invalidate all sessions
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Log password reset
    await AuditService.log({
      userId: user.id,
      action: AuditAction.PASSWORD_RESET_COMPLETE,
      metadata: {
        email,
      },
    });
  }
} 