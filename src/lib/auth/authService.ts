import { 
  LoginService,
  CredentialService,
  UserProfileService,
  VerificationService,
  PasswordResetService
} from './core';
import type { 
  AuthResultWithTokens,
  LoginCredentials,
  EmailVerificationParams,
  UserWithSecurityInfo,
  UserPublicProfile
} from './types/authTypes';
import { createToken } from './tokens/tokenUtils';
import type { TokenPayloadType } from './types/authTypes';

/**
 * Main authentication service that delegates to specialized services
 */
export class AuthService {
  /**
   * Authenticates a user with email and password
   * 
   * @param credentials - Login credentials
   * @returns Authentication result with tokens and user information
   */
  static async login(credentials: LoginCredentials): Promise<AuthResultWithTokens> {
    return LoginService.login(credentials);
  }

  /**
   * Validates user credentials without performing a login
   * 
   * @param email - User email
   * @param password - User password
   * @returns User information if credentials are valid, null otherwise
   */
  static async validateCredentials(email: string, password: string): Promise<Partial<UserWithSecurityInfo> | null> {
    return CredentialService.validateCredentials(email, password);
  }

  /**
   * Initiates the email verification process
   * 
   * @param params - Email verification parameters
   */
  static async initiateEmailVerification(params: EmailVerificationParams): Promise<void> {
    return VerificationService.initiateEmailVerification(params);
  }

  /**
   * Verifies a user's email using a verification token
   * 
   * @param token - Email verification token
   * @returns Partial user information
   */
  static async verifyEmail(token: string): Promise<Partial<UserWithSecurityInfo>> {
    return VerificationService.verifyEmail(token);
  }

  /**
   * Initiates the password reset process
   * 
   * @param email - Email of the user requesting password reset
   */
  static async initiatePasswordReset(email: string): Promise<void> {
    return PasswordResetService.initiatePasswordReset(email);
  }

  /**
   * Resets a user's password using a reset token
   * 
   * @param token - Password reset token
   * @param newPassword - New password
   * @returns Partial user information
   */
  static async resetPassword(token: string, newPassword: string): Promise<Partial<UserWithSecurityInfo>> {
    return PasswordResetService.resetPassword(token, newPassword);
  }

  /**
   * Retrieves a user's public profile
   * 
   * @param userId - ID of the user to retrieve
   * @returns User's public profile
   */
  static async getUserProfile(userId: string): Promise<UserPublicProfile> {
    return UserProfileService.getUserProfile(userId);
  }
}

// Re-export the token creation function
export { createToken };
export type { TokenPayloadType }; 