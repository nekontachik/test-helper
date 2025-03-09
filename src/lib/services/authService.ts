import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logger } from '@/lib/logger';
import { ErrorFactory } from '@/lib/errors/ErrorFactory';
import type { ErrorCode } from '@/lib/errors/types';
import { sendEmail } from '@/lib/utils/emailService';

interface PasswordResetToken {
  token: string;
  userId: string;
  expiresAt: Date;
}

export class AuthService {
  private passwordResetTokens: Map<string, PasswordResetToken> = new Map();
  private readonly tokenExpirationMinutes = 30;
  private readonly jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

  async initiatePasswordReset(email: string): Promise<void> {
    try {
      logger.info('Initiating password reset', { email });

      // In a real app, you would look up the user in your database
      const user = await this.findUserByEmail(email);
      if (!user) {
        // Don't reveal if the email exists or not
        logger.info('Password reset requested for non-existent email', { email });
        return;
      }

      // Generate a unique token
      const token = uuidv4();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + this.tokenExpirationMinutes);

      // Store the token
      this.passwordResetTokens.set(token, {
        token,
        userId: user.id,
        expiresAt
      });

      // Generate reset link
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

      // Send email
      await sendEmail({
        to: email,
        subject: 'Password Reset Request',
        html: `
          <h1>Password Reset Request</h1>
          <p>You have requested to reset your password. Click the link below to proceed:</p>
          <a href="${resetLink}">Reset Password</a>
          <p>This link will expire in ${this.tokenExpirationMinutes} minutes.</p>
          <p>If you did not request this reset, please ignore this email.</p>
        `
      });

      logger.info('Password reset email sent', { email });
    } catch (error) {
      logger.error('Failed to initiate password reset', { error, email });
      throw ErrorFactory.create('PROCESSING_ERROR' as ErrorCode, 'Failed to initiate password reset');
    }
  }

  async validateResetToken(token: string): Promise<boolean> {
    try {
      logger.info('Validating reset token');

      const resetToken = this.passwordResetTokens.get(token);
      if (!resetToken) {
        logger.warn('Invalid reset token provided');
        return false;
      }

      if (new Date() > resetToken.expiresAt) {
        logger.warn('Reset token has expired');
        this.passwordResetTokens.delete(token);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Failed to validate reset token', { error });
      return false;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      logger.info('Resetting password');

      const resetToken = this.passwordResetTokens.get(token);
      if (!resetToken) {
        throw ErrorFactory.create('INVALID_TOKEN' as ErrorCode, 'Invalid or expired reset token');
      }

      if (new Date() > resetToken.expiresAt) {
        this.passwordResetTokens.delete(token);
        throw ErrorFactory.create('INVALID_TOKEN' as ErrorCode, 'Reset token has expired');
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password in your database
      await this.updateUserPassword(resetToken.userId, hashedPassword);

      // Remove the used token
      this.passwordResetTokens.delete(token);

      logger.info('Password reset successful', { userId: resetToken.userId });
    } catch (error) {
      logger.error('Failed to reset password', { error });
      throw error;
    }
  }

  private async findUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
    // In a real app, this would query your database
    // This is just a mock implementation
    return {
      id: '123',
      email: email
    };
  }

  private async updateUserPassword(userId: string, _hashedPassword: string): Promise<void> {
    // In a real app, this would update the user's password in your database
    // This is just a mock implementation
    logger.info('Updating user password', { userId });
  }

  generateAuthToken(userId: string): string {
    return jwt.sign({ userId }, this.jwtSecret, { expiresIn: '1d' });
  }

  verifyAuthToken(token: string): { userId: string } {
    try {
      return jwt.verify(token, this.jwtSecret) as { userId: string };
    } catch (error: unknown) {
      logger.error('Failed to verify auth token', { error });
      throw ErrorFactory.create('INVALID_TOKEN' as ErrorCode, 'Invalid authentication token');
    }
  }
} 