import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import type { UserRole } from '@/types/auth';
import type { Action, Resource } from '@/types/rbac';
import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/logger';

type ApiHandlerFunction = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void>;

interface ApiAuthOptions {
  allowedRoles: UserRole[];
  requireVerified?: boolean;
  action?: Action;
  resource: Resource;
  checkOwnership?: boolean;
  allowTeamMembers?: boolean;
  getProjectId?: (req: NextApiRequest) => string;
}

export function withApiAuth(
  handler: ApiHandlerFunction,
  options: ApiAuthOptions
) {
  return async function authHandler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    try {
      const session = await getServerSession(req, res, authOptions);

      if (!session?.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Check if user has required role
      const userRole = session.user.role as UserRole;
      if (!options.allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Check verified requirement if specified
      if (options.requireVerified && !session.user.emailVerified) {
        return res.status(403).json({ message: 'Email verification required' });
      }

      // Check ownership if required
      if (options.checkOwnership && options.getProjectId) {
        const _projectId = options.getProjectId(req);
        // Add your ownership check logic here
      }

      return handler(req, res);
    } catch (error) {
      logger.error('Auth middleware error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
} 