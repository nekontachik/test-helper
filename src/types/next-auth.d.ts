import 'next-auth';
import type { UserRole } from './auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      role: UserRole;
      emailVerified: string | null;
      twoFactorAuthenticated: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    emailVerified: string | null;
    twoFactorAuthenticated: boolean;
  }
}
