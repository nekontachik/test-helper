import { prisma } from '@/lib/prisma';
import { UserRole, Action, Resource } from '@/types/rbac';
import { RBAC_RULES } from './config';
import logger from '@/lib/logger';
import type { Permission, ResourceContext } from '@/types/rbac';

export class RBACService {
  private static permissionCache = new Map<string, boolean>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private static getCacheKey(
    role: UserRole,
    action: Action,
    resource: Resource,
    context?: ResourceContext
  ): string {
    return `${role}:${action}:${resource}:${JSON.stringify(context || {})}`;
  }

  private static findPermission(
    permissions: Permission[],
    action: Action,
    resource: Resource
  ): Permission | undefined {
    return permissions.find(p => 
      (p.action === action || p.action === Action.MANAGE) && 
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

    if (teamMember && context.projectId && context.userId) {
      const member = await prisma.projectMember.findFirst({
        where: {
          userId: context.userId,
          projectId: context.projectId,
        },
      });
      return !!member;
    }

    return true;
  }

  private static cacheResult(key: string, result: boolean): void {
    this.permissionCache.set(key, result);
    setTimeout(() => this.permissionCache.delete(key), this.CACHE_TTL);
  }

  static async can(
    role: UserRole,
    action: Action,
    resource: Resource,
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
      logger.error('RBAC check failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        role,
        action,
        resource,
        context
      });
      return false;
    }
  }
} 