// Unified role type for the entire application
export type UserRole = 
  | 'USER' 
  | 'ADMIN'
  | 'PROJECT_MANAGER'
  | 'TESTER'
  | 'VIEWER';

// Core user type that matches our database
export type CoreUser = {
  id: string;
  email: string;
  role: UserRole;
  name: string | null;
  image: string | null;
};

// Auth user type for use with NextAuth
export type AuthUser = CoreUser;

// NextAuth user type
export type NextAuthUser = CoreUser; 