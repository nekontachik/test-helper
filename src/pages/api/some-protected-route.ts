import { NextApiRequest, NextApiResponse } from 'next';
import { withApiAuth } from '@/middleware/apiAuth';
import { Action, Resource } from '@/types/rbac';
import { UserRole } from '@/types/auth';
import logger from '@/lib/logger';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Your protected route logic here
    return res.status(200).json({ message: 'This is a protected route' });
  } catch (error) {
    logger.error('Protected route error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withApiAuth(handler, {
  allowedRoles: [UserRole.ADMIN, UserRole.MANAGER],
  requireVerified: true,
  action: Action.READ,
  resource: Resource.PROJECT as Resource,
  checkOwnership: true,
  allowTeamMembers: true,
  getProjectId: (req: NextApiRequest) => String(req.query.projectId)
});
