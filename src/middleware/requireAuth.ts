// Add combined auth middleware
export function requireAuth(_config: {
  requireVerified?: boolean;
  require2FA?: boolean;
  allowedRoles?: string[];
}): void {
  // Implement combined auth checks
} 