import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from '@/app/api/projects/[projectId]/test-cases/route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  testCase: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const createMockRequest = (method: string, body?: any, searchParams?: URLSearchParams): NextRequest => {
  const url = new URL('http://localhost:3000/api/projects/project1/test-cases');
  const req = new NextRequest(url, {
    method,
    ...(body && { body: JSON.stringify(body) })
  });

  if (searchParams) {
    Object.defineProperty(req, 'nextUrl', {
      get: () => ({ searchParams }),
    });
  }

  return req;
};

describe('Test Case API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/projects/[projectId]/test-cases should return test cases', async () => {
    const mockTestCases = [{ id: '1', title: 'Test Case 1' }];
    (prisma.testCase.findMany as jest.Mock).mockResolvedValue(mockTestCases);

    const request = createMockRequest('GET');
    const handler = await GET;
    const response = await handler(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(expect.objectContaining({
      testCases: mockTestCases,
    }));
  });

  it('POST /api/projects/[projectId]/test-cases should create a new test case', async () => {
    const mockCreatedTestCase = { id: '2', title: 'New Test Case', description: 'Description' };
    (prisma.testCase.create as jest.Mock).mockResolvedValue(mockCreatedTestCase);

    const request = createMockRequest('POST', { title: 'New Test Case', description: 'Description' });
    const handler = await POST;
    const response = await handler(request);

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(mockCreatedTestCase);
  });

  // Remove PUT test since PUT is not exported from the route
});
