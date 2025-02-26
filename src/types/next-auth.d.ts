import 'next-auth';
import type { UserRole } from './auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string | null;
      name: string | null;
      image: string | null;
      role: UserRole;
      twoFactorEnabled: boolean;
      twoFactorAuthenticated: boolean;
      emailVerified: Date | null;
    }
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    role: UserRole;
    twoFactorEnabled: boolean;
    twoFactorAuthenticated: boolean;
    emailVerified: Date | null;
  }

  interface JWT {
    id: string;
    email: string;
    role: UserRole;
    twoFactorEnabled: boolean;
    twoFactorAuthenticated: boolean;
    emailVerified: Date | null;
  }
}
