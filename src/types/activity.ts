import { UserRole } from '@/types/auth';

export enum ActivityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  PASSWORD_RESET = 'password_reset',
  PASSWORD_RESET_REQUESTED = 'password_reset_requested',
  PASSWORD_RESET_COMPLETED = 'password_reset_completed',
  EMAIL_VERIFIED = 'email_verified',
  EMAIL_CHANGE_REQUESTED = 'email_change_requested',
  EMAIL_CHANGE_COMPLETED = 'email_change_completed',
  EMAIL_CHANGE_FAILED = 'email_change_failed',
  TWO_FACTOR_ENABLED = 'two_factor_enabled',
  TWO_FACTOR_DISABLED = 'two_factor_disabled',
  TWO_FACTOR_VERIFY = 'two_factor_verify',
  ACCOUNT_CREATED = 'account_created',
  ACCOUNT_UPDATED = 'account_updated',
  ACCOUNT_DELETED = 'account_deleted',
  ACCOUNT_DELETION_SCHEDULED = 'account_deletion_scheduled',
  ACCOUNT_DELETION_FAILED = 'account_deletion_failed',
  ACCOUNT_RECOVERY_REQUESTED = 'account_recovery_requested',
  ACCOUNT_RECOVERY_COMPLETED = 'account_recovery_completed',
  ACCOUNT_RECOVERY_FAILED = 'account_recovery_failed',
  SECURITY_ALERT = 'security_alert',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SESSION_CREATED = 'session_created',
  SESSION_EXPIRED = 'session_expired',
  SESSION_REVOKED = 'session_revoked',
  API_KEY_CREATED = 'api_key_created',
  API_KEY_REVOKED = 'api_key_revoked',
  API_KEY_EXPIRED = 'api_key_expired'
}

export interface ActivityLogEntry {
  type: ActivityEventType;
  userId: string;
  details: {
    targetUserId?: string;
    changes?: {
      [key: string]: {
        from: unknown;
        to: unknown;
      };
    };
    metadata?: Record<string, unknown>;
  };
  context?: ActivityContext;
}

export interface ActivityContext {
  ip?: string;
  userAgent?: string;
  location?: string;
} 