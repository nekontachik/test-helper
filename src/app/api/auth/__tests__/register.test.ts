import { POST } from '../register/route';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { UserRole } from '@/types/auth';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new user successfully', async () => {
    const mockUser = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (hash as jest.Mock).mockResolvedValue('hashedPassword');
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: '1',
      ...mockUser,
      role: UserRole.USER,
    });

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(mockUser),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe('User created successfully');
    expect(data.user).toBeDefined();
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: mockUser.email,
        name: mockUser.name,
        password: 'hashedPassword',
      }),
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  });

  it('should return error for existing user', async () => {
    const mockUser = {
      email: 'existing@example.com',
      password: 'password123',
      name: 'Existing User',
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1', ...mockUser });

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(mockUser),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('User already exists');
  });

  it('should return error for missing required fields', async () => {
    const mockUser = {
      email: 'test@example.com',
      // missing password and name
    };

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(mockUser),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Missing required fields');
  });
});
