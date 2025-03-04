// Export types
export * from './types';

// Export core functionality
export { isAccessTokenPayload, isAuthError } from './guards';
export { checkAuthentication } from './auth';
export { withRBAC, createRBACMiddleware } from './middleware';

// Export presets
export {
  adminOnly,
  projectManagerOnly,
  authenticated,
  verified
} from './presets'; 