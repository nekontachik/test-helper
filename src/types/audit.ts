export enum AuditAction {
  API_REQUEST = 'api_request',
  CREATE_VERIFICATION_TOKEN = 'create_verification_token',
  CREATE_VERIFICATION_TOKEN_FAILED = 'create_verification_token_failed',
  VERIFY_EMAIL = 'verify_email',
  VERIFY_EMAIL_FAILED = 'verify_email_failed',
  SESSION_CREATED = 'session_created',
  SESSION_INVALIDATED = 'session_invalidated',
  SESSION_EXPIRED = 'session_expired',
  TWO_FACTOR_VERIFY = 'two_factor_verify',
  TWO_FACTOR_ENABLE = 'two_factor_enable',
  TWO_FACTOR_DISABLE = 'two_factor_disable',
  ACCOUNT_LOCKOUT = 'account_lockout',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_LOGIN_FAILED = 'user_login_failed',
}

export enum AuditLogType {
  SECURITY = 'SECURITY',
  USER = 'USER',
  SYSTEM = 'SYSTEM',
}

export interface AuditContext {
  ip?: string;
  userAgent?: string;
}

export interface AuditLogData {
  type: AuditLogType;
  userId: string;
  action: string;
  metadata?: Record<string, unknown>;
  context?: AuditContext;
} 