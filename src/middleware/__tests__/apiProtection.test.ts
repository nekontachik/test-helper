import { apiProtection } from '../apiProtection';
import { getToken } from 'next-auth/jwt';
import { UserRole } from '@/types/rbac';

jest.mock('next-auth/jwt');

describe('apiProtection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow authenticated requests', async () => {
    (getToken as jest.Mock).mockResolvedValue({
      sub: 'user1',
      role: UserRole.ADMIN,
      emailVerified: true,
    });

    const request = new Request('http://localhost/api/projects');
    const response = await apiProtection(request);
    expect(response.status).not.toBe(401);
  });

  it('should block unauthorized requests', async () => {
    (getToken as jest.Mock).mockResolvedValue(null);

    const request = new Request('http://localhost/api/projects');
    const response = await apiProtection(request);
    expect(response.status).toBe(401);
  });
}); 