import 'next-auth';
import { UserRole } from './auth';

declare module 'next-auth' {
  interface Session {
    id: string;
    user: {
      id: string;
      email: string;
      role: UserRole;
      twoFactorEnabled: boolean;
      emailVerified: Date | null;
      twoFactorAuthenticated: boolean;
    };
  }

  interface JWT {
    id: string;
    role: UserRole;
    twoFactorEnabled: boolean;
    emailVerified: Date | null;
  }
}
