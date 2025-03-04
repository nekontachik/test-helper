/**
 * @file Audit-related type definitions
 * 
 * Defines the audit types and interfaces for security logging.
 */

/**
 * Audit log types
 */
export enum AuditLogType {
  AUTH = 'AUTH',
  USER = 'USER',
  ADMIN = 'ADMIN',
  SECURITY = 'SECURITY',
  DATA = 'DATA',
  SYSTEM = 'SYSTEM'
}

/**
 * Audit actions
 */
export enum AuditAction {
  // Authentication actions
  USER_LOGIN_ATTEMPT = 'USER_LOGIN_ATTEMPT',
  USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS',
  USER_LOGIN_FAILED = 'USER_LOGIN_FAILED',
  USER_LOGOUT = 'USER_LOGOUT',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED = 'PASSWORD_RESET_COMPLETED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  
  // Email verification actions
  EMAIL_VERIFICATION_REQUESTED = 'EMAIL_VERIFICATION_REQUESTED',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  EMAIL_VERIFICATION_FAILED = 'EMAIL_VERIFICATION_FAILED',
  
  // User management actions
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  
  // Security actions
  ACCOUNT_LOCKOUT = 'ACCOUNT_LOCKOUT',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  TWO_FACTOR_ENABLED = 'TWO_FACTOR_ENABLED',
  TWO_FACTOR_DISABLED = 'TWO_FACTOR_DISABLED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  
  // Session actions
  SESSION_CREATED = 'SESSION_CREATED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SESSION_REVOKED = 'SESSION_REVOKED',
  
  // Data actions
  DATA_EXPORTED = 'DATA_EXPORTED',
  DATA_IMPORTED = 'DATA_IMPORTED',
  SENSITIVE_DATA_ACCESSED = 'SENSITIVE_DATA_ACCESSED'
}

/**
 * Audit log status
 */
export type AuditLogStatus = 'SUCCESS' | 'FAILED' | 'PENDING';

/**
 * Audit log entry
 */
export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: AuditAction;
  type: AuditLogType;
  status: AuditLogStatus;
  metadata: Record<string, unknown>;
  details?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

/**
 * Audit log creation parameters
 */
export interface AuditLogParams {
  userId: string;
  action: AuditAction;
  type: AuditLogType;
  metadata: Record<string, unknown>;
  details?: Record<string, unknown>;
  status: AuditLogStatus;
  ip?: string;
  userAgent?: string;
} 