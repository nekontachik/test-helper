import type { Session } from 'next-auth';
import type { UserRole } from '@/types/auth';
import type { PrismaClient } from '@prisma/client';

export const mockSession: Session = {
  user: {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    image: null,
    role: 'USER' as UserRole,
    twoFactorEnabled: false,
    twoFactorAuthenticated: false,
    emailVerified: null
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
};

type MockPrismaClient = {
  testCase: {
    create: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    findMany: jest.Mock;
  };
  testCaseVersion: {
    create: jest.Mock;
    findMany: jest.Mock;
    findFirst: jest.Mock;
  };
  testResult: {
    deleteMany: jest.Mock;
  };
  $transaction: jest.Mock;
};

export const mockPrismaClient = (): jest.Mocked<PrismaClient> => {
  const mockClient: MockPrismaClient = {
    testCase: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    testCaseVersion: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    testResult: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockClient)),
  };

  return mockClient as unknown as jest.Mocked<PrismaClient>;
}; 