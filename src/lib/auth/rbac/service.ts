import { prisma } from '@/lib/prisma';
import { UserRole, ActionType, ResourceType } from '@/types/rbac';
import logger from '@/lib/logger';
import type { Permission, ResourceContext } from '@/types/rbac';

interface RBACRule {
  role: UserRole;
  permissions: Permission[];
}

const RBAC_RULES: RBACRule[] = [
  {
    role: 'ADMIN',
    permissions: [
      { action: ActionType.MANAGE, resource: ResourceType.PROJECT },
      { action: ActionType.MANAGE, resource: ResourceType.TEST_CASE },
      { action: ActionType.MANAGE, resource: ResourceType.TEST_RUN },
      { action: ActionType.MANAGE, resource: ResourceType.USER },
      { action: ActionType.MANAGE, resource: ResourceType.REPORT },
    ],
  },
  {
    role: 'PROJECT_MANAGER',
    permissions: [
      { action: ActionType.MANAGE, resource: ResourceType.PROJECT },
      { action: ActionType.MANAGE, resource: ResourceType.TEST_CASE },
      { action: ActionType.MANAGE, resource: ResourceType.TEST_RUN },
      { action: ActionType.READ, resource: ResourceType.USER },
      { action: ActionType.MANAGE, resource: ResourceType.REPORT },
    ],
  },
  {
    role: 'TESTER',
    permissions: [
      { action: ActionType.READ, resource: ResourceType.PROJECT },
      { action: ActionType.MANAGE, resource: ResourceType.TEST_CASE },
      { action: ActionType.MANAGE, resource: ResourceType.TEST_RUN },
      { action: ActionType.READ, resource: ResourceType.USER },
      { action: ActionType.CREATE, resource: ResourceType.REPORT },
    ],
  },
  {
    role: 'VIEWER',
    permissions: [
      { action: ActionType.READ, resource: ResourceType.PROJECT },
      { action: ActionType.READ, resource: ResourceType.TEST_CASE },
      { action: ActionType.READ, resource: ResourceType.TEST_RUN },
      { action: ActionType.READ, resource: ResourceType.REPORT },
    ],
  },
];

interface ProjectMember {
  userId: string;
}

export class RBACService {
  private static permissionCache = new Map<string, boolean>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private static getCacheKey(
    role: UserRole,
    action: ActionType,
    resource: ResourceType,
    context?: ResourceContext
  ): string {
    return `${role}:${action}:${resource}:${JSON.stringify(context || {})}`;
  }

  private static findPermission(
    permissions: Permission[],
    action: ActionType,
    resource: ResourceType
  ): Permission | undefined {
    return permissions.find(p => 
      (p.action === action || p.action === ActionType.MANAGE) && 
      p.resource === resource
    );
  }

  private static async checkConditions(
    permission: Permission,
    context?: ResourceContext
  ): Promise<boolean> {
    if (!permission.conditions) return true;
    if (!context) return false;

    const { isOwner, teamMember } = permission.conditions;

    if (isOwner && context.userId !== context.resourceOwnerId) {
      return false;
    }

    if (teamMember && context.userId && context.teamMembers) {
      return context.teamMembers.includes(context.userId);
    }

    return true;
  }

  private static cacheResult(key: string, result: boolean): void {
    this.permissionCache.set(key, result);
    setTimeout(() => this.permissionCache.delete(key), this.CACHE_TTL);
  }

  static async can(
    role: UserRole,
    action: ActionType,
    resource: ResourceType,
    context?: ResourceContext
  ): Promise<boolean> {
    try {
      const cacheKey = this.getCacheKey(role, action, resource, context);
      const cachedResult = this.permissionCache.get(cacheKey);
      if (cachedResult !== undefined) {
        return cachedResult;
      }

      const rule = RBAC_RULES.find(r => r.role === role);
      if (!rule) {
        this.cacheResult(cacheKey, false);
        return false;
      }

      const permission = this.findPermission(rule.permissions, action, resource);
      if (!permission) {
        this.cacheResult(cacheKey, false);
        return false;
      }

      const result = await this.checkConditions(permission, context);
      this.cacheResult(cacheKey, result);
      return result;
    } catch (error) {
      logger.error('RBAC check failed:', error);
      return false;
    }
  }

  static async isTeamMember(userId: string, projectId: string): Promise<boolean> {
    try {
      const member = await prisma.projectMember.findFirst({
        where: {
          userId,
          projectId,
        },
      });

      return !!member;
    } catch (error) {
      logger.error('Team membership check failed:', error);
      return false;
    }
  }
} 