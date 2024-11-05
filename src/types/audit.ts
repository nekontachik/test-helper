export enum AuditAction {
  API_REQUEST = 'api_request',
  CREATE_VERIFICATION_TOKEN = 'create_verification_token',
  CREATE_VERIFICATION_TOKEN_FAILED = 'create_verification_token_failed',
  VERIFY_EMAIL = 'verify_email',
  VERIFY_EMAIL_FAILED = 'verify_email_failed',
  SESSION_CREATED = 'session_created',
  SESSION_INVALIDATED = 'session_invalidated',
  SESSION_EXPIRED = 'session_expired',
}

export type AuditLogType = 'system' | 'user_action' | 'email_verification' | 'auth';

export interface AuditLogData {
  userId: string;
  type: AuditLogType;
  action: AuditAction;
  metadata: Record<string, unknown>;
} 