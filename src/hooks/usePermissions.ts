import { useSession } from 'next-auth/react';
import { RBACService } from '@/lib/auth/rbac/service';
import { Action, Resource } from '@/types/rbac';
import type { Session, AuthUser } from '@/lib/auth/types';

interface ExtendedSession extends Session {
  user: AuthUser;
}

export function usePermissions() {
  const { data: session } = useSession() as { data: ExtendedSession | null };

  const can = async (
    action: Action,
    resource: Resource,
    context?: {
      userId?: string;
      resourceOwnerId?: string;
      teamMembers?: string[];
      status?: string;
    }
  ): Promise<boolean> => {
    if (!session?.user) return false;

    return RBACService.can(
      session.user.role,
      action,
      resource,
      {
        userId: session.user.id,
        ...context,
      }
    );
  };

  return { can };
}
