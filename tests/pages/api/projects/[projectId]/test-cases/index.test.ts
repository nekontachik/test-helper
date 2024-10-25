import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/projects/[projectId]/test-cases/route';
import { prisma } from '@/lib/prisma';
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
    const mockTestCases = [
      { id: '1', title: 'Test Case 1', status: TestCaseStatus.ACTIVE, priority: TestCasePriority.HIGH },
      { id: '2', title: 'Test Case 2', status: TestCaseStatus.DRAFT, priority: TestCasePriority.MEDIUM },
    ];

    (prisma.testCase.findMany as jest.Mock).mockResolvedValue(mockTestCases);
    (prisma.testCase.count as jest.Mock).mockResolvedValue(2);

    const url = new URL('http://localhost:3000/api/projects/project1/test-cases');
    const request = new NextRequest(url);
    const handler = await GET;
    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      data: mockTestCases,
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  });

  it('POST: creates a test case successfully', async () => {
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

    const url = new URL('http://localhost:3000/api/projects/project1/test-cases');
    const request = new NextRequest(url, {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Test Case',
        description: 'Description',
        status: TestCaseStatus.ACTIVE,
        priority: TestCasePriority.HIGH,
        expectedResult: 'Expected Result',
      }),
    });
    const handler = await POST;
    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual(mockCreatedTestCase);
  });
});
