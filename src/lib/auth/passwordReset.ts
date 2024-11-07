import { prisma } from '@/lib/prisma';
import { TokenService, TokenType, type TokenPayload } from './tokens/tokenService';
import { PasswordPolicyService } from './passwordPolicy';
import { sendPasswordResetEmail } from '../emailService';
import { AuditService } from '../audit/auditService';
import { AuditLogType } from '@/types/audit';
import { SecurityError } from '@/lib/errors';
import * as bcrypt from 'bcrypt';

export enum PasswordResetAction {
  REQUEST = 'PASSWORD_RESET_REQUEST',
  COMPLETE = 'PASSWORD_RESET_COMPLETE',
}

interface PasswordResetPayload extends TokenPayload {
  email: string;
}

export class PasswordResetService {
  private static readonly TOKEN_EXPIRY = '1h'; // 1 hour

  static async initiateReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true },
    });

    if (!user) return;

    // Generate reset token
    const payload: TokenPayload = {
      type: TokenType.PASSWORD_RESET,
      userId: user.id,
      email,
    };

    const token = await TokenService.createToken(payload, this.TOKEN_EXPIRY);

    // Send reset email
    await sendPasswordResetEmail(email, user.name || 'User', token);

    // Log reset request
    await AuditService.log({
      type: AuditLogType.SECURITY,
      userId: user.id,
      action: PasswordResetAction.REQUEST,
      metadata: {
        email,
        tokenExpiry: this.TOKEN_EXPIRY,
      },
    });
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    // Verify and decode token
    const payload = await TokenService.verifyToken(token, TokenType.PASSWORD_RESET);
    if (!payload?.email) {
      throw new SecurityError('Invalid or expired reset token');
    }

    // Validate password strength
    const validationResult = await PasswordPolicyService.validatePassword(newPassword, {
      email: payload.email,
    });

    if (!validationResult.isStrong) {
      const errorMessage = 'Password is too weak: ' + 
        validationResult.feedback.suggestions.join('. ');
      throw new SecurityError(errorMessage);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new SecurityError('User not found');
    }

    // Check password history
    const isReused = await PasswordPolicyService.validatePasswordHistory(
      user.id,
      newPassword
    );

    if (!isReused) {
      throw new SecurityError('Cannot reuse recent passwords');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password in a transaction
    await prisma.$transaction([
      // Update password
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),

      // Add to password history
      prisma.passwordHistory.create({
        data: {
          userId: user.id,
          hash: hashedPassword,
        },
      }),

      // Invalidate all sessions
      prisma.session.deleteMany({
        where: { userId: user.id },
      }),
    ]);

    // Revoke the reset token
    await TokenService.revokeToken(token, TokenType.PASSWORD_RESET);

    // Log password reset
    await AuditService.log({
      type: AuditLogType.SECURITY,
      userId: user.id,
      action: PasswordResetAction.COMPLETE,
      metadata: {
        email: user.email,
      },
    });
  }
} 