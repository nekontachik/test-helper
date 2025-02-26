import { RBAC_RULES } from './rbac/config';
import type { 
  UserRole,
  Resource,
  Permission,
  ResourceContext,
  RBACRule 
} from '@/types/rbac';
import { 
  Action 
} from '@/types/rbac';
import { prisma } from '@/lib/prisma';
import { AuthorizationError } from '@/lib/errors';
import logger from '@/lib/logger';

interface CacheEntry {
  value: boolean;
  timestamp: number;
}

interface ProjectMember {
  userId: string;
}

export class RBACService {
  private static permissionCache = new Map<string, CacheEntry>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private static getCacheKey(
    role: UserRole,
    action: Action,
    resource: Resource,
    context?: ResourceContext
  ): string {
    return `${role}:${action}:${resource}:${JSON.stringify(context || {})}`;
  }

  private static cacheResult(key: string, value: boolean): void {
    this.permissionCache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  private static getCachedResult(key: string): boolean | undefined {
    const entry = this.permissionCache.get(key);
    if (!entry) return undefined;

    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.permissionCache.delete(key);
      return undefined;
    }

    return entry.value;
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

    if (teamMember && context.userId && context.projectId) {
      return this.checkTeamMembership(context.userId, context.projectId);
    }

    return true;
  }

  private static async checkTeamMembership(userId: string, projectId: string): Promise<boolean> {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          members: {
            where: { userId },
            select: { userId: true }
          }
        }
      });

      const members = project?.members || [];
      return members.some((member: { userId: string }) => member.userId === userId);
    } catch (error) {
      logger.error('Team membership check failed:', { error, userId, projectId });
      return false;
    }
  }

  static async can(
    role: UserRole,
    action: Action,
    resource: Resource,
    context?: ResourceContext
  ): Promise<boolean> {
    try {
      const cacheKey = this.getCacheKey(role, action, resource, context);
      const cachedResult = this.getCachedResult(cacheKey);
      
      if (cachedResult !== undefined) {
        return cachedResult;
      }

      const rule = RBAC_RULES.find((r: RBACRule) => r.role === role);
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
        error,
        role,
        action,
        resource,
        context
      });
      throw new AuthorizationError('Permission check failed');
    }
  }

  static async hasPermission(
    userId: string,
    action: Action,
    resource: Resource,
    context?: Omit<ResourceContext, 'userId'>
  ): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user) return false;

      return this.can(user.role as UserRole, action, resource, {
        ...context,
        userId
      });
    } catch (error) {
      logger.error('Permission check failed:', {
        error,
        userId,
        action,
        resource,
        context
      });
      return false;
    }
  }
} 