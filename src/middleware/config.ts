import { UserRole, UserRoles } from '@/types/rbac';

const ROLES = {
  ADMIN: 'ADMIN',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  TESTER: 'TESTER',
  VIEWER: 'VIEWER'
} as const;

export const MIDDLEWARE_CONFIG = {
  // Authentication settings
  auth: {
    publicPaths: [
      '/auth/signin',
      '/auth/signup',
      '/auth/reset-password',
      '/api/auth/(.*)' // Allow all auth API routes
    ],
    protectedPaths: [
      '/dashboard/(.*)',
      '/projects/(.*)',
      '/settings/(.*)',
      '/api/(?!auth)(.*)' // Protect all non-auth API routes
    ],
  },

  // Role-based route access
  roleAccess: {
    '/admin/(.*)': [UserRoles.ADMIN],
    '/projects/manage/(.*)': [UserRoles.PROJECT_MANAGER, UserRoles.ADMIN],
    '/reports/(.*)': [UserRoles.PROJECT_MANAGER, UserRoles.ADMIN],
  } as Record<string, UserRole[]>,

  // Rate limiting configurations
  rateLimit: {
    auth: { points: 5, duration: 300 },    // 5 attempts per 5 minutes
    api: { points: 100, duration: 60 },    // 100 requests per minute
    admin: { points: 50, duration: 60 },   // 50 requests per minute
  },

  // Security headers
  securityHeaders: {
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
  },
}; 