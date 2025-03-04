import { prisma } from '@/lib/prisma';
import type { UserRole } from '@/types/auth';
import type { AccountStatus } from '@/types/auth';
import { TokenType } from '@/types/token';
import { TokenService } from '@/lib/auth/tokens/tokenService';
import { InvalidTokenError, TokenExpiredError } from '@/lib/errors/authErrors';
import type { EmailVerificationParams, UserWithSecurityInfo } from '../types/authTypes';

export class VerificationService {
  /**
   * Initiates the email verification process
   * 
   * @param params - Email verification parameters
   */
  static async initiateEmailVerification(_params: EmailVerificationParams): Promise<void> {
    // Implementation would be added here
    // This is just a placeholder for the extracted function
  }

  /**
   * Verifies a user's email using a verification token
   * 
   * @param token - Email verification token
   * @returns Partial user information
   * @throws InvalidTokenError if token is invalid
   * @throws TokenExpiredError if token is expired
   */
  static async verifyEmail(token: string): Promise<Partial<UserWithSecurityInfo>> {
    const payload = await TokenService.verifyToken(token);
    if (!payload || payload.type !== TokenType.EMAIL_VERIFICATION) {
      throw new Error('Invalid verification token');
    }

    if (!payload.userId || !payload.email) {
      throw new InvalidTokenError('verification');
    }

    if (payload.exp && typeof payload.exp === 'number' && payload.exp < Date.now() / 1000) {
      throw new TokenExpiredError('verification');
    }

    const user = await prisma.user.update({
      where: { id: payload.userId },
      data: { emailVerified: new Date() },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        role: true,
        status: true,
        failedLoginAttempts: true
      },
    });
    
    // Cast to the correct type
    return {
      ...user,
      role: user.role as UserRole,
      status: user.status as AccountStatus
    };
  }
} 