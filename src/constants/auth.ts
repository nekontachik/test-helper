/**
 * @file Authentication and authorization constants
 * 
 * This file contains all constants related to authentication,
 * authorization, and security throughout the application.
 */

import { UserRole } from '@/types/auth';

/**
 * Authentication constants
 */
export const AUTH_CONSTANTS = {
  SESSION: {
    DEFAULT_DURATION_HOURS: 24,
    EXTENDED_DURATION_HOURS: 168, // 7 days
    REMEMBER_ME_DURATION_HOURS: 720, // 30 days
    MAX_SESSIONS_PER_USER: 5,
  },
  
  TOKENS: {
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',
    EMAIL_VERIFICATION_EXPIRY: '24h',
    PASSWORD_RESET_EXPIRY: '1h',
    INVITATION_EXPIRY: '7d',
    JWT_ISSUER: 'your-app-name',
    JWT_AUDIENCE: 'your-app-users',
  },
  
  SECURITY: {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_HASH_ROUNDS: 12,
    MAX_LOGIN_ATTEMPTS: 5,
    ACCOUNT_LOCKOUT_DURATION_MINUTES: 30,
    TWO_FACTOR_CODE_LENGTH: 6,
    TWO_FACTOR_CODE_EXPIRY_MINUTES: 10,
    BACKUP_CODES_COUNT: 10,
    RATE_LIMIT: {
      LOGIN_POINTS: 5,
      LOGIN_DURATION: 60 * 15, // 15 minutes
      PASSWORD_RESET_POINTS: 3,
      PASSWORD_RESET_DURATION: 60 * 60, // 1 hour
      REGISTRATION_POINTS: 3,
      REGISTRATION_DURATION: 60 * 60, // 1 hour
    },
  },
  
  COOKIES: {
    SESSION_COOKIE_NAME: 'next-auth.session-token',
    REFRESH_COOKIE_NAME: 'next-auth.refresh-token',
    CSRF_COOKIE_NAME: 'next-auth.csrf-token',
    SECURE: process.env.NODE_ENV === 'production',
    SAME_SITE: 'lax' as const,
    HTTP_ONLY: true,
    MAX_AGE: 30 * 24 * 60 * 60, // 30 days
  },
  
  DEFAULTS: {
    ROLE: UserRole.USER,
    ACCOUNT_STATUS: 'PENDING' as const,
  },
};

/**
 * Error messages for authentication and authorization
 */
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Your account has been locked due to too many failed login attempts',
  ACCOUNT_DISABLED: 'Your account has been disabled',
  EMAIL_NOT_VERIFIED: 'Please verify your email address before logging in',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again',
  INSUFFICIENT_PERMISSIONS: 'You do not have permission to access this resource',
  INVALID_TOKEN: 'Invalid or expired token',
  TWO_FACTOR_REQUIRED: 'Two-factor authentication is required',
  INVALID_TWO_FACTOR_CODE: 'Invalid two-factor authentication code',
  PASSWORD_TOO_WEAK: 'Password does not meet security requirements',
  EMAIL_ALREADY_EXISTS: 'A user with this email already exists',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token',
  MAX_SESSIONS_EXCEEDED: 'Maximum number of active sessions reached',
};

/**
 * Role hierarchy and permissions
 */
export const ROLE_CONFIG = {
  // Role hierarchy (higher number = more permissions)
  HIERARCHY: {
    [UserRole.USER]: 10,
    [UserRole.VIEWER]: 20,
    [UserRole.EDITOR]: 30,
    [UserRole.TESTER]: 40,
    [UserRole.PROJECT_MANAGER]: 50,
    [UserRole.ADMIN]: 100,
  },
  
  // Role permissions mapping
  PERMISSIONS: {
    [UserRole.USER]: [
      'read:projects',
      'read:testCases',
    ],
    [UserRole.VIEWER]: [
      'read:projects',
      'read:testCases',
      'read:testRuns',
      'read:reports',
    ],
    [UserRole.EDITOR]: [
      'read:projects',
      'read:testCases',
      'create:testCases',
      'update:testCases',
      'read:testRuns',
      'read:reports',
    ],
    [UserRole.TESTER]: [
      'read:projects',
      'read:testCases',
      'create:testCases',
      'update:testCases',
      'read:testRuns',
      'create:testRuns',
      'update:testRuns',
      'read:reports',
    ],
    [UserRole.PROJECT_MANAGER]: [
      'read:projects',
      'create:projects',
      'update:projects',
      'read:testCases',
      'create:testCases',
      'update:testCases',
      'delete:testCases',
      'read:testRuns',
      'create:testRuns',
      'update:testRuns',
      'delete:testRuns',
      'read:reports',
      'create:reports',
      'read:team',
      'update:team',
    ],
    [UserRole.ADMIN]: ['*'], // All permissions
  },
  
  // Role descriptions for UI
  DESCRIPTIONS: {
    [UserRole.USER]: 'Basic user with limited access',
    [UserRole.VIEWER]: 'Can view projects and test cases',
    [UserRole.EDITOR]: 'Can create and edit test cases',
    [UserRole.TESTER]: 'Can create and run tests',
    [UserRole.PROJECT_MANAGER]: 'Can manage projects and team members',
    [UserRole.ADMIN]: 'Full system access',
  },
};

/**
 * Routes configuration
 */
export const AUTH_ROUTES = {
  // Public routes that don't require authentication
  PUBLIC: [
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
    '/api/auth/.*', // RegExp for all auth API routes
    '/', // Homepage
    '/about',
    '/contact',
    '/privacy',
    '/terms',
  ],
  
  // Routes that require specific roles
  PROTECTED: {
    '/admin/.*': [UserRole.ADMIN],
    '/projects/new': [UserRole.PROJECT_MANAGER, UserRole.ADMIN],
    '/projects/edit/.*': [UserRole.PROJECT_MANAGER, UserRole.ADMIN],
    '/settings/.*': [UserRole.ADMIN],
    '/reports/.*': [UserRole.VIEWER, UserRole.EDITOR, UserRole.TESTER, UserRole.PROJECT_MANAGER, UserRole.ADMIN],
  },
  
  // Default redirect paths
  REDIRECTS: {
    AFTER_SIGNIN: '/dashboard',
    AFTER_SIGNOUT: '/',
    UNAUTHORIZED: '/auth/signin',
    FORBIDDEN: '/403',
  },
}; 