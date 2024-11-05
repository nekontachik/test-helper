import { TokenService } from '@/services/token';
import { AuditLogger } from '@/services/audit';
import type { EmailVerificationData, EmailVerificationToken } from '@/types/auth';

export async function createVerificationToken(userId: string, email: string): Promise<EmailVerificationToken> {
  try {
    const token = await TokenService.createToken({
      type: 'email_verification',
      userId,
      expiresIn: '24h'
    });

    // Log the token creation
    await AuditLogger.log({
      userId,
      type: 'email_verification',
      action: 'create_verification_token',
      metadata: {
        event: 'verification_token_created',
        email
      }
    } as EmailVerificationData);

    return {
      value: token.value,
      expiresAt: token.expiresAt
    };
  } catch (error) {
    // Log the error
    await AuditLogger.log({
      userId,
      type: 'email_verification',
      action: 'create_verification_token_failed',
      metadata: {
        event: 'verification_token_creation_failed',
        email,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    } as EmailVerificationData);

    throw error;
  }
}

export async function verifyEmailToken(token: string): Promise<boolean> {
  try {
    const verifiedToken = await TokenService.verifyToken(token, 'email_verification');
    
    if (!verifiedToken) {
      return false;
    }

    await AuditLogger.log({
      userId: verifiedToken.userId,
      type: 'email_verification',
      action: 'verify_email',
      metadata: {
        event: 'email_verified',
        email: verifiedToken.email
      }
    } as EmailVerificationData);

    return true;
  } catch (error) {
    // Log verification failure but don't throw
    await AuditLogger.log({
      userId: 'unknown',
      type: 'email_verification',
      action: 'verify_email_failed',
      metadata: {
        event: 'email_verification_failed',
        email: 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    } as EmailVerificationData);

    return false;
  }
} 