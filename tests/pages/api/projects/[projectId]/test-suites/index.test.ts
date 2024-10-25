import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/projects/[projectId]/test-suites';
import { prisma } from '@/lib/prisma';
import { getSession } from 'next-auth/react';

jest.mock('next-auth/react');
jest.mock('@/lib/prisma', () => ({
  testSuite: {
    create: jest.fn(),
  },
}));

describe('/api/projects/[projectId]/test-suites', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a test suite successfully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      query: { projectId: 'project1' },
      body: {
        name: 'Test Suite 1',
        description: 'Description for Test Suite 1',
      },
    });

    (getSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });
    (prisma.testSuite.create as jest.Mock).mockResolvedValue({
      id: '1',
      name: 'Test Suite 1',
      description: 'Description for Test Suite 1',
      projectId: 'project1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: {
        testSuite: {
          id: '1',
          name: 'Test Suite 1',
          description: 'Description for Test Suite 1',
          projectId: 'project1',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      },
    });
  });

  it('handles unauthorized access', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      query: { projectId: 'project1' },
    });

    (getSession as jest.Mock).mockResolvedValue(null);

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Unauthorized',
    });
  });

  it('handles validation errors', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      query: { projectId: 'project1' },
      body: {
        // Missing required fields
      },
    });

    (getSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: expect.any(String),
    });
  });
});
