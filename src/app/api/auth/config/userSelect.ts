import type { Prisma } from '@prisma/client';

/**
 * User select fields for consistent querying
 */
export const userSelect = {
  id: true,
  email: true,
  name: true,
  password: true,
  role: true,
  status: true,
  image: true,
  emailVerified: true,
  twoFactorEnabled: true,
  twoFactorSecret: true,
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
} satisfies Prisma.UserSelect; 