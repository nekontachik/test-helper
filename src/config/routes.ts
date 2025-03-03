import { UserRole } from '@/types/auth';

export interface RouteConfig {
  requireAuth: boolean;
  roles?: UserRole[];
  requireVerified?: boolean;
  require2FA?: boolean;
  rateLimit?: {
    points: number;
    duration: number;
  };
}

export interface ApiRouteConfig extends RouteConfig {
  // API-specific config options
  sensitiveData?: boolean;
  auditActions?: boolean;
}

// Define all route patterns and their configurations
export const ROUTES = {
  // Public routes
  public: {
    '/auth/(.*)': { requireAuth: false },
    '/api/auth/(.*)': { requireAuth: false },
    '/api/public/(.*)': { requireAuth: false },
  },
  
  // Protected web routes
  web: {
    '/dashboard': { 
      requireAuth: true, 
      requireVerified: true 
    },
    '/profile': { 
      requireAuth: true 
    },
    '/projects/(.*)': { 
      requireAuth: true, 
      roles: [UserRole.PROJECT_MANAGER, UserRole.ADMIN, UserRole.TESTER],
      requireVerified: true 
    },
    '/test-cases/(.*)': { 
      requireAuth: true, 
      roles: [UserRole.PROJECT_MANAGER, UserRole.ADMIN, UserRole.TESTER],
      requireVerified: true 
    },
    '/reports/(.*)': { 
      requireAuth: true, 
      roles: [UserRole.PROJECT_MANAGER, UserRole.ADMIN],
      requireVerified: true 
    },
    '/admin/(.*)': { 
      requireAuth: true, 
      roles: [UserRole.ADMIN],
      requireVerified: true,
      require2FA: true 
    },
  },
  
  // Protected API routes
  api: {
    '/api/projects/(.*)': {
      requireAuth: true,
      roles: [UserRole.PROJECT_MANAGER, UserRole.ADMIN, UserRole.TESTER],
      requireVerified: true,
      rateLimit: { points: 100, duration: 60 },
      auditActions: true
    },
    '/api/test-cases/(.*)': {
      requireAuth: true,
      roles: [UserRole.PROJECT_MANAGER, UserRole.ADMIN, UserRole.TESTER],
      requireVerified: true,
      rateLimit: { points: 100, duration: 60 },
      auditActions: true
    },
    '/api/admin/(.*)': {
      requireAuth: true,
      roles: [UserRole.ADMIN],
      requireVerified: true,
      require2FA: true,
      rateLimit: { points: 50, duration: 60 },
      auditActions: true,
      sensitiveData: true
    },
  }
};

// Rate limiting configurations
export const RATE_LIMITS = {
  auth: { points: 5, duration: 300 },    // 5 attempts per 5 minutes
  api: { points: 100, duration: 60 },    // 100 requests per minute
  admin: { points: 50, duration: 60 },   // 50 requests per minute
};

// Security headers
export const SECURITY_HEADERS = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'blob:', 'data:'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
  },
}; 