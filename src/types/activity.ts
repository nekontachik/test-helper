import { Role } from '../lib/auth/types';

export type ActivityEventType = 
  | 'ROLE_CHANGE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'TWO_FACTOR_ENABLE'
  | 'TWO_FACTOR_DISABLE';

export interface ActivityContext {
  ip?: string;
  userAgent?: string;
  location?: string;
}

export interface ActivityType {
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