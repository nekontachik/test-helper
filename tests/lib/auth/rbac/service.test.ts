import { RBACService } from '../service';
import { prisma } from '@/lib/prisma';
import { UserRole, ActionType, ResourceType } from '@/types/rbac';

jest.mock('@/lib/prisma', () => ({
  project: {
    findUnique: jest.fn(),
  },
}));

describe('RBACService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('can', () => {
    it('should allow admin all permissions', async () => {
      const result = await RBACService.can(
        UserRole.ADMIN,
        ActionType.CREATE,
        ResourceType.PROJECT
      );
      expect(result).toBe(true);
    });

    it('should respect role permissions', async () => {
      const result = await RBACService.can(
        UserRole.VIEWER,
        ActionType.DELETE,
        ResourceType.PROJECT
      );
      expect(result).toBe(false);
    });
  });

  describe('checkTeamMembership', () => {
    it('should verify team membership', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue({
        projectMembers: [{ userId: 'user1' }],
      });

      const result = await RBACService['checkTeamMembership']('user1', 'project1');
      expect(result).toBe(true);
    });
  });
}); 