/**
 * Auth middleware configuration
 */
export const config = {
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    tokenExpirySeconds: 60 * 60 * 24, // 24 hours
    refreshTokenExpirySeconds: 60 * 60 * 24 * 7, // 7 days
    cookieName: 'token',
    secureCookies: process.env.NODE_ENV === 'production'
  },
  routes: {
    loginPath: '/auth/login',
    verifyEmailPath: '/auth/verify',
    twoFactorPath: '/auth/2fa/verify',
    unauthorizedPath: '/unauthorized',
    errorPath: '/error'
  }
}; 