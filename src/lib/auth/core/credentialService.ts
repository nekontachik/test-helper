import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import type { UserRole } from '@/types/auth';
import type { AccountStatus } from '@/types/auth';
import type { UserWithSecurityInfo } from '../types/authTypes';

export class CredentialService {
  /**
   * Validates user credentials without performing a login
   * 
   * @param email - User email
   * @param password - User password (plain text)
   * @returns User information if credentials are valid, null otherwise
   */
  static async validateCredentials(email: string, password: string): Promise<Partial<UserWithSecurityInfo> | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        status: true,
        failedLoginAttempts: true,
        emailVerified: true,
        twoFactorEnabled: true
      },
    });

    if (!user || !await compare(password, user.password)) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    
    // Cast to the correct type
    return {
      ...userWithoutPassword,
      role: userWithoutPassword.role as UserRole,
      status: userWithoutPassword.status as AccountStatus
    };
  }
} 