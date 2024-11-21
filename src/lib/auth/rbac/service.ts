import { prisma } from '@/lib/prisma';
import { Action, Resource } from '@/types/rbac';
import { UserRole } from '@/types/auth';
import logger from '@/lib/logger';

interface PermissionCheck {
  action: Action;
  resource: Resource;
  resourceId?: string;
}

interface RBACContext {
  userId: string;
  resourceOwnerId: string;
  teamMembers: string[];
  projectId: string;
}

export class RBACService {
  static async checkPermission(
    userId: string,
    userRole: UserRole,
    check: PermissionCheck
  ): Promise<boolean> {
    try {
      // Check role-based permissions first
      const hasRolePermission = await this.checkRolePermission(userRole, check.action, check.resource);
      if (!hasRolePermission) {
        return false;
      }

      // If resourceId is provided, check resource-specific permissions
      if (check.resourceId) {
        return await this.checkResourcePermission(userId, check);
      }

      return true;
    } catch (error) {
      logger.error('Permission check failed:', error);
      return false;
    }
  }

  private static async checkRolePermission(
    role: UserRole,
    action: Action,
    resource: Resource
  ): Promise<boolean> {
    const permission = await prisma.userPermission.findFirst({
      where: {
        user: {
          role: role
        },
        permission: {
          name: `${action}_${resource}`
        }
      },
    });

    return !!permission;
  }

  private static async checkResourcePermission(
    userId: string,
    check: PermissionCheck
  ): Promise<boolean> {
    if (check.resource === Resource.PROJECT) {
      // Check project membership
      const membership = await prisma.projectMember.findFirst({
        where: {
          userId,
          projectId: check.resourceId,
        }
      });
      return !!membership;
    }

    // Add other resource-specific checks here
    return true;
  }

  static can(
    role: UserRole,
    action: Action,
    resource: Resource,
    context: RBACContext
  ): boolean {
    // Admin has full access
    if (role === UserRole.ADMIN) {
      return true;
    }

    // Resource owner has full access to their own resources
    if (context.userId === context.resourceOwnerId) {
      return true;
    }

    // Project owner has full access to project resources
    if (context.userId === context.projectId) {
      return true;
    }

    // Team members have access based on their role and the action
    if (context.teamMembers.includes(context.userId)) {
      switch (role) {
        case UserRole.MANAGER:
          // Managers can perform all actions
          return true;

        case UserRole.EDITOR:
          // Editors can create, read, update but not delete
          return action !== Action.DELETE;

        case UserRole.VIEWER:
          // Viewers can only read
          return action === Action.READ;

        default:
          return false;
      }
    }

    // Default deny
    return false;
  }
} 