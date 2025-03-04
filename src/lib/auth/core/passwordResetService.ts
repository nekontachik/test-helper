import { prisma } from '@/lib/prisma';
import type { UserRole } from '@/types/auth';
import type { AccountStatus } from '@/types/auth';
import { TokenType } from '@/types/token';
import { TokenService } from '@/lib/auth/tokens/tokenService';
import { SecurityService } from '@/lib/security/securityService';
import { InvalidTokenError } from '@/lib/errors/authErrors';
import type { UserWithSecurityInfo } from '../types/authTypes';

export class PasswordResetService {
  /**
   * Initiates the password reset process
   * 
   * @param email - Email of the user requesting password reset
   */
  static async initiatePasswordReset(_email: string): Promise<void> {
    // Implementation would be added here
    // This is just a placeholder for the extracted function
  }

  /**
   * Resets a user's password using a reset token
   * 
   * @param token - Password reset token
   * @param newPassword - New password
   * @returns Partial user information
   * @throws InvalidTokenError if token is invalid
   */
  static async resetPassword(token: string, newPassword: string): Promise<Partial<UserWithSecurityInfo>> {
    const payload = await TokenService.verifyToken(token);
    if (!payload || payload.type !== TokenType.PASSWORD_RESET) {
      throw new InvalidTokenError('password reset');
    }

    if (!payload.userId) {
      throw new InvalidTokenError('password reset');
    }

    const hashedPassword = await SecurityService.hashPassword(newPassword);
    
    // Use transaction to ensure atomicity
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update the password
      const user = await tx.user.update({
        where: { id: payload.userId },
        data: { 
          password: hashedPassword,
          updatedAt: new Date()
        },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          failedLoginAttempts: true,
          emailVerified: true
        },
      });
      
      // Invalidate all existing sessions for this user
      await tx.session.deleteMany({
        where: { userId: payload.userId }
      });
      
      // Log the password change
      await tx.activityLog.create({
        data: {
          userId: payload.userId,
          type: 'PASSWORD_CHANGED',
          action: 'PASSWORD_CHANGED',
          metadata: JSON.stringify({
            method: 'reset',
            tokenId: payload.jti
          })
        }
      });
      
      return user;
    });
    
    // Cast to the correct type
    return {
      ...updatedUser,
      role: updatedUser.role as UserRole,
      status: updatedUser.status as AccountStatus
    };
  }
} 