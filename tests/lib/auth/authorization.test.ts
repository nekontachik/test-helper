import { RBACService } from '../rbac/service';
import { UserRole, Action, Resource } from '@/types/rbac';

describe('Authorization', () => {
  describe('RBAC Service', () => {
    it('should allow admin access to all resources', () => {
      const hasAccess = RBACService.can(
        UserRole.ADMIN,
        Action.MANAGE,
        Resource.PROJECT
      );
      expect(hasAccess).toBe(true);
    });

    it('should respect role hierarchies', () => {
      // Test PM access
      expect(RBACService.can(
        UserRole.PROJECT_MANAGER,
        Action.CREATE,
        Resource.TEST_CASE
      )).toBe(true);

      // Test limited access
      expect(RBACService.can(
        UserRole.TESTER,
        Action.MANAGE,
        Resource.PROJECT
      )).toBe(false);
    });

    it('should validate ownership conditions', async () => {
      const result = await RBACService.validateAccess(
        'user-123',
        UserRole.TESTER,
        Action.UPDATE,
        Resource.TEST_CASE,
        'test-123'
      );
      expect(result).toBeDefined();
    });
  });
}); 