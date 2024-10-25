import { UserRole } from '@/types/auth';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string;
}

export interface MockSession {
  user: Omit<MockUser, 'password'>;
}

export interface MockCredentials {
  email: string;
  password: string;
}

export const createMockUser = (overrides?: Partial<MockUser>): MockUser => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: UserRole.USER,
  password: 'hashedPassword',
  ...overrides,
});

export const createMockSession = (user: MockUser): MockSession => ({
  user: {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  },
});

export const createMockCredentials = (overrides?: Partial<MockCredentials>): MockCredentials => ({
  email: 'test@example.com',
  password: 'password123',
  ...overrides,
});
