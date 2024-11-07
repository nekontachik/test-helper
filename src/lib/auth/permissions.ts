import { USER_ROLES } from '@/lib/constants/auth';

interface AuthUser {
  id: string;
  email: string;
  role: keyof typeof USER_ROLES;
}

export function hasPermission(user: AuthUser, path: string): boolean {
  // Add your permission logic here
  // Example:
  switch (user.role) {
    case USER_ROLES.ADMIN:
      return true; // Admins have access to everything
    case USER_ROLES.USER:
      return !path.startsWith('/admin'); // Users can't access admin routes
    default:
      return false;
  }
} 