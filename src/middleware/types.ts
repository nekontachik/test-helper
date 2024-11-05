import type { UserRole } from '@/types/rbac';

export interface MiddlewareContext {
  token?: {
    sub: string;
    role: UserRole;
    email: string;
    emailVerified?: boolean;
    twoFactorEnabled?: boolean;
    twoFactorAuthenticated?: boolean;
  };
  pathname: string;
  ip: string;
  userAgent?: string;
}

export interface MiddlewareResponse {
  response: Response;
  context: MiddlewareContext;
}

export interface MiddlewareConfig {
  requireAuth?: boolean;
  requireVerified?: boolean;
  require2FA?: boolean;
  allowedRoles?: UserRole[];
  rateLimit?: {
    points: number;
    duration: number;
  };
} 