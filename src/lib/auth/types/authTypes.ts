import type { UserRole } from '@/types/auth';
import type { User } from '@/types/auth';
import type { TokenType } from '@/types/token';

/**
 * Authentication result with tokens
 */
export interface AuthResultWithTokens {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  sessionId: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  ip?: string;
  userAgent?: string;
}

/**
 * Email verification parameters
 */
export interface EmailVerificationParams {
  userId: string;
  email: string;
  name: string;
}

/**
 * User with security information
 */
export type UserWithSecurityInfo = Pick<User, 'id' | 'email' | 'role' | 'status' | 'emailVerified'> & {
  failedLoginAttempts: number;
};

/**
 * User public profile
 */
export type UserPublicProfile = Pick<User, 'id' | 'email' | 'name' | 'role'>;

/**
 * Token payload type
 */
export type TokenPayloadType<T extends TokenType> = 
  T extends TokenType.EMAIL_VERIFICATION ? { userId: string; email: string } :
  T extends TokenType.PASSWORD_RESET ? { userId: string } :
  never; 