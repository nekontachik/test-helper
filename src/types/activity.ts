import { Role } from '../lib/auth/types';

export enum ActivityEventType {
  SESSIONS_REVOKED = 'SESSIONS_REVOKED',
  SESSION_ACTIVITY = 'SESSION_ACTIVITY',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PROFILE_UPDATED = 'PROFILE_UPDATED',
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