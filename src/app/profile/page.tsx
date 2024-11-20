import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProfileManagement } from '@/components/profile/ProfileManagement';
import type { AuthUser, UserRole, AccountStatus, Permission } from '@/types/auth';
import { cache } from 'react';
import logger from '@/lib/logger';

/**
 * Cached database query for user data with optimized field selection
 */
const getUserData = cache(async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        emailVerified: true,
        twoFactorEnabled: true,
        emailNotificationsEnabled: true,
        userPermissions: {
          select: {
            permission: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      },
    });

    if (!user) return null;

    // Transform permissions to match Permission type
    const permissions: Permission[] = user.userPermissions.map(up => ({
      id: up.permission.id,
      name: up.permission.name,
      description: up.permission.description || '' // Convert null to empty string
    }));

    return {
      ...user,
      permissions
    };
  } catch (error) {
    logger.error('Failed to fetch user data:', error);
    throw new Error('Failed to load user profile');
  }
});

/**
 * Profile page component
 */
export default async function ProfilePage() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      redirect('/auth/signin');
    }

    const user = await getUserData(session.user.id);
    if (!user) {
      logger.warn('User not found:', { userId: session.user.id });
      redirect('/auth/signin');
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: null,
      role: user.role as UserRole,
      status: user.status as AccountStatus,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorAuthenticated: session.user.twoFactorAuthenticated || false,
      emailNotificationsEnabled: user.emailNotificationsEnabled,
      permissions: user.permissions
    };

    return (
      <div className="container max-w-4xl py-8">
        <ProfileManagement 
          user={authUser}
          currentSessionId={session.user.id}
        />
      </div>
    );
  } catch (error) {
    logger.error('Profile page error:', error);
    redirect('/error?message=Failed to load profile');
  }
}

// Metadata
export const metadata = {
  title: 'Profile Settings',
  description: 'Manage your profile settings and preferences',
};

// Config
export const dynamic = 'force-dynamic';
export const revalidate = 0;