import type { UserRole } from '@/types/auth';

export interface AuthToken {
  sub: string;
  email: string;
  role: UserRole;
  isVerified?: boolean;
  isTwoFactorEnabled?: boolean;
  exp?: number;
  iat?: number;
}

export interface BaseRouteConfig {
  requireAuth: boolean;
}

export interface PublicRouteConfig extends BaseRouteConfig {
  isPublic: boolean;
}

export interface ApiRouteConfig extends BaseRouteConfig {
  isApi: boolean;
  roles?: UserRole[];
  requireVerified?: boolean;
  requireTwoFactor?: boolean;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}

export interface WebRouteConfig extends BaseRouteConfig {
  isWeb: boolean;
  roles?: UserRole[];
  requireVerified?: boolean;
  requireTwoFactor?: boolean;
  redirectTo?: string;
}

export type RouteConfig = PublicRouteConfig | ApiRouteConfig | WebRouteConfig; 