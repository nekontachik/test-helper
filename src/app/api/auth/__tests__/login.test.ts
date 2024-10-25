import { authOptions } from '../[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { UserRole } from '@/types/auth';
import type { CredentialsConfig } from 'next-auth/providers/credentials';
import { createMockUser, createMockCredentials, MockUser } from '@/lib/testUtils';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('NextAuth Credentials Provider', () => {
  const mockCredentials = createMockCredentials();
  const mockUser: MockUser = createMockUser();

  type CredentialsType = {
    email: { label: string; type: string };
    password: { label: string; type: string };
  };

  const getCredentialsProvider = () => {
    const provider = authOptions.providers.find(
      provider => provider.id === 'credentials'
    ) as CredentialsConfig<CredentialsType>;
    
    if (!provider?.authorize) {
      throw new Error('Credentials provider or authorize function not found');
    }

    return provider;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should authenticate valid credentials', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (compare as jest.Mock).mockResolvedValue(true);

    const provider = getCredentialsProvider();
    const user = await provider.authorize(mockCredentials, {} as any);

    expect(user).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      role: mockUser.role,
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: mockCredentials.email },
    });
  });

  it('should throw error for invalid credentials', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (compare as jest.Mock).mockResolvedValue(false);

    const provider = getCredentialsProvider();

    await expect(provider.authorize(mockCredentials, {} as any))
      .rejects.toThrow('Invalid password');

    expect(compare).toHaveBeenCalledWith(
      mockCredentials.password,
      mockUser.password
    );
  });

  it('should throw error for non-existent user', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const provider = getCredentialsProvider();

    await expect(provider.authorize(mockCredentials, {} as any))
      .rejects.toThrow('User not found');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: mockCredentials.email },
    });
  });

  it('should throw error for missing credentials', async () => {
    const provider = getCredentialsProvider();
    const emptyCredentials = { email: '', password: '' };

    await expect(provider.authorize(emptyCredentials, {} as any))
      .rejects.toThrow('Invalid credentials');
  });
});
