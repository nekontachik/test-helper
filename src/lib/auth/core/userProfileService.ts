import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';
import { isValidUserRole } from '@/lib/utils/typeGuards';
import type { UserPublicProfile } from '../types/authTypes';

export class UserProfileService {
  /**
   * Retrieves a user's public profile
   * 
   * @param userId - ID of the user to retrieve
   * @returns User's public profile
   * @throws Error if user not found
   */
  static async getUserProfile(userId: string): Promise<UserPublicProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      ...user,
      name: user.name || '',
      role: this.validateUserRole(user.role)
    };
  }

  /**
   * Validates if a role is a valid UserRole and returns it
   * Falls back to default role if invalid
   * 
   * @param role - Role to validate
   * @returns Valid UserRole
   */
  private static validateUserRole(role: unknown): UserRole {
    // Use the centralized type guard
    if (isValidUserRole(role)) {
      return role;
    }
    
    // Default to USER role if invalid
    return UserRole.USER;
  }
} 