import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '@/app/api/projects/[projectId]/test-cases/route';
import prisma from '@/lib/prisma';
import { TestCaseStatus, TestCasePriority } from '@/types';

jest.mock('@/lib/prisma', () => ({
  testCase: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
}));

describe('/api/projects/[projectId]/test-cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET: fetches test cases successfully', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: { projectId: 'project1' },
    });

    const mockTestCases = [
      { id: '1', title: 'Test Case 1', status: TestCaseStatus.ACTIVE, priority: TestCasePriority.HIGH },
      { id: '2', title: 'Test Case 2', status: TestCaseStatus.DRAFT, priority: TestCasePriority.MEDIUM },
    ];

    (prisma.testCase.findMany as jest.Mock).mockResolvedValue(mockTestCases);
    (prisma.testCase.count as jest.Mock).mockResolvedValue(2);

    await GET(req as any, { params: { projectId: 'project1' } } as any);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      data: mockTestCases,
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  });

  it('POST: creates a test case successfully', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      query: { projectId: 'project1' },
      body: {
        title: 'New Test Case',
        description: 'Description',
        status: TestCaseStatus.ACTIVE,
        priority: TestCasePriority.HIGH,
        expectedResult: 'Expected Result',
      },
    });

    const mockCreatedTestCase = {
      id: '3',
      title: 'New Test Case',
      description: 'Description',
      status: TestCaseStatus.ACTIVE,
      priority: TestCasePriority.HIGH,
      expectedResult: 'Expected Result',
      projectId: 'project1',
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.testCase.create as jest.Mock).mockResolvedValue(mockCreatedTestCase);

    await POST(req as any, { params: { projectId: 'project1' } } as any);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toEqual(mockCreatedTestCase);
  });
});
