import { createMocks } from 'node-mocks-http';
import handler from '../../../../../../pages/api/projects/[projectId]/test-cases/[testCaseId]';
import prisma from '../../../../../../lib/prisma';
import { getSession } from 'next-auth/react';

jest.mock('next-auth/react');
jest.mock('../../../../../../lib/prisma', () => ({
  testCase: {
    update: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('/api/projects/[projectId]/test-cases/[testCaseId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates a test case successfully', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      query: { projectId: 'project1', testCaseId: 'testCase1' },
      body: {
        title: 'Updated Test Case',
        description: 'Updated Description',
        status: 'ACTIVE',
        priority: 'HIGH',
      },
    });

    (getSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });
    (prisma.testCase.update as jest.Mock).mockResolvedValue({
      id: 'testCase1',
      title: 'Updated Test Case',
      description: 'Updated Description',
      status: 'ACTIVE',
      priority: 'HIGH',
      projectId: 'project1',
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: {
        testCase: {
          id: 'testCase1',
          title: 'Updated Test Case',
          description: 'Updated Description',
          status: 'ACTIVE',
          priority: 'HIGH',
          projectId: 'project1',
        },
      },
    });
  });

  it('handles unauthorized access', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      query: { projectId: 'project1', testCaseId: 'testCase1' },
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
      method: 'PUT',
      query: { projectId: 'project1', testCaseId: 'testCase1' },
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
