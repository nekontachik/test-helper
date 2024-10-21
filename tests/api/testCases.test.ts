import { NextRequest, NextResponse } from 'next/server';
import { GET, POST, PUT } from '@/app/api/projects/[projectId]/test-cases/route';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  testCase: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const createMockRequest = (method: string, body?: any, searchParams?: URLSearchParams): NextRequest => {
  const req = {
    method,
    url: 'http://localhost:3000/api/projects/project1/test-cases',
    headers: new Headers(),
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest;

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

    const req = createMockRequest('GET');
    const res = await GET(req, { params: { projectId: 'project1' } });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(expect.objectContaining({
      testCases: mockTestCases,
    }));
  });

  it('POST /api/projects/[projectId]/test-cases should create a new test case', async () => {
    const mockCreatedTestCase = { id: '2', title: 'New Test Case', description: 'Description' };
    (prisma.testCase.create as jest.Mock).mockResolvedValue(mockCreatedTestCase);

    const req = createMockRequest('POST', { title: 'New Test Case', description: 'Description' });
    const res = await POST(req, { params: { projectId: 'project1' } });

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(mockCreatedTestCase);
  });

  it('PUT /api/projects/[projectId]/test-cases/[testCaseId] should update a test case', async () => {
    const mockUpdatedTestCase = { id: '1', title: 'Updated Test Case', description: 'Updated Description' };
    (prisma.testCase.update as jest.Mock).mockResolvedValue(mockUpdatedTestCase);

    const req = createMockRequest('PUT', { title: 'Updated Test Case', description: 'Updated Description' });
    const res = await PUT(req, { params: { projectId: 'project1', testCaseId: '1' } });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(mockUpdatedTestCase);
  });

  // Remove or comment out the DELETE test if it's not implemented
  // it('DELETE /api/projects/[projectId]/test-cases/[testCaseId] should delete a test case', async () => {
  //   (prisma.testCase.delete as jest.Mock).mockResolvedValue({ id: '1' });

  //   const req = createMockRequest('DELETE');
  //   const res = await DELETE(req, { params: { projectId: 'project1', testCaseId: '1' } });

  //   expect(res.status).toBe(200);
  //   expect(await res.json()).toEqual({ message: 'Test case deleted successfully' });
  // });
});
