/**
 * Middleware configuration
 * 
 * This file contains configuration settings for the middleware handlers.
 */

/**
 * Rate limit configuration for different paths
 */
export interface RateLimitConfig {
  points: number;   // Number of requests allowed
  duration: number; // Time window in seconds
}

/**
 * Middleware configuration
 */
export const MIDDLEWARE_CONFIG = {
  /**
   * Rate limiting configuration for different path patterns
   */
  rateLimits: {
    // Authentication endpoints
    '/api/auth/.*': {
      points: 10,
      duration: 60 * 5 // 5 minutes
    },
    
    // Admin endpoints (more strict)
    '/api/admin/.*': {
      points: 30,
      duration: 60 * 10 // 10 minutes
    },
    
    // Regular API endpoints
    '/api/.*': {
      points: 60,
      duration: 60 * 15 // 15 minutes
    }
  } as Record<string, RateLimitConfig>,
  
  /**
   * Security settings
   */
  security: {
    // CSRF protection settings
    csrf: {
      enabled: true,
      ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
      cookieName: 'csrf-token',
      headerName: 'X-CSRF-Token'
    },
    
    // Content Security Policy settings
    csp: {
      enabled: true
    }
  },
  
  /**
   * Logging configuration
   */
  logging: {
    // Whether to log all requests
    logAllRequests: process.env.NODE_ENV === 'development',
    
    // Whether to log request bodies (can contain sensitive data)
    logRequestBodies: false,
    
    // Paths to exclude from logging
    excludePaths: [
      '/api/health',
      '/api/metrics',
      '/_next/.*'
    ]
  }
}; 