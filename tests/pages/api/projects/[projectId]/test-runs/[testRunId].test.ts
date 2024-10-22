import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '@/app/api/projects/[projectId]/test-runs/[testRunId]/route';
import prisma from '@/lib/prisma';
import { TestRunStatus } from '@/types';
import { getServerSession } from 'next-auth/next';

jest.mock('@/lib/prisma', () => ({
  testRun: {
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(() => Promise.resolve({ user: { id: 'user1' } })),
}));

describe('/api/projects/[projectId]/test-runs/[testRunId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRequest = (method: string, body?: any) => {
    return {
      method,
      json: () => Promise.resolve(body),
    } as unknown as NextRequest;
  };

  const mockParams = { projectId: 'project1', testRunId: 'testRun1' };

  it('gets a test run successfully', async () => {
    (prisma.testRun.findUnique as jest.Mock).mockResolvedValue({
      id: 'testRun1',
      name: 'Test Run 1',
      status: TestRunStatus.PENDING,
      projectId: 'project1',
    });

    const response = await GET(mockRequest('GET'), { params: mockParams });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({
      success: true,
      data: {
        id: 'testRun1',
        name: 'Test Run 1',
        status: TestRunStatus.PENDING,
        projectId: 'project1',
      },
    });
  });

  it('updates a test run successfully', async () => {
    (prisma.testRun.update as jest.Mock).mockResolvedValue({
      id: 'testRun1',
      name: 'Updated Test Run',
      status: TestRunStatus.COMPLETED,
      projectId: 'project1',
    });

    const response = await PUT(
      mockRequest('PUT', {
        name: 'Updated Test Run',
        status: TestRunStatus.COMPLETED,
      }),
      { params: mockParams }
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({
      success: true,
      data: {
        id: 'testRun1',
        name: 'Updated Test Run',
        status: TestRunStatus.COMPLETED,
        projectId: 'project1',
      },
    });
  });

  it('deletes a test run successfully', async () => {
    (prisma.testRun.delete as jest.Mock).mockResolvedValue({
      id: 'testRun1',
      name: 'Deleted Test Run',
      status: TestRunStatus.COMPLETED,
      projectId: 'project1',
    });

    const response = await DELETE(mockRequest('DELETE'), { params: mockParams });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({
      success: true,
      data: {
        id: 'testRun1',
        name: 'Deleted Test Run',
        status: TestRunStatus.COMPLETED,
        projectId: 'project1',
      },
    });
  });

  it('handles not found error', async () => {
    (prisma.testRun.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await GET(mockRequest('GET'), { params: { ...mockParams, testRunId: 'nonexistent' } });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toEqual({
      success: false,
      error: 'Test run not found',
    });
  });

  it('handles unauthorized access', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce(null);

    const response = await GET(mockRequest('GET'), { params: mockParams });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({
      success: false,
      error: 'Unauthorized',
    });
  });

  // Add more tests as needed for error handling, validation, etc.
});
