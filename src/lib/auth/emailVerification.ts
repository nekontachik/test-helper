import { TokenService } from '@/services/token';
import { AuditLogger } from '@/services/audit';
import { AuditLogType } from '@/types/audit';
import type { EmailVerificationToken } from '@/types/auth';
import type { AuditLogData } from '@/types/audit';

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
      type: AuditLogType.SECURITY,
      action: 'create_verification_token',
      metadata: {
        event: 'verification_token_created',
        email,
        type: 'email_verification'
      }
    });

    return {
      value: token.value,
      expiresAt: token.expiresAt
    };
  } catch (error) {
    // Log the error
    await AuditLogger.log({
      userId,
      type: AuditLogType.SECURITY,
      action: 'create_verification_token_failed',
      metadata: {
        event: 'verification_token_creation_failed',
        email,
        type: 'email_verification',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });

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
      type: AuditLogType.SECURITY,
      action: 'verify_email',
      metadata: {
        event: 'email_verified',
        email: verifiedToken.email,
        type: 'email_verification'
      }
    });

    return true;
  } catch (error) {
    // Log verification failure but don't throw
    await AuditLogger.log({
      userId: 'unknown',
      type: AuditLogType.SECURITY,
      action: 'verify_email_failed',
      metadata: {
        event: 'email_verification_failed',
        email: 'unknown',
        type: 'email_verification',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });

    return false;
  }
} 