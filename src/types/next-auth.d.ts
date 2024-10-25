import 'next-auth';
import { UserRole } from './auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    emailVerified?: Date | null;
  }
  
  interface Session {
    user: User & {
      id: string;
      role: UserRole;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
