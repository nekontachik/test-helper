import { NextRequest } from 'next/server';
import { GET } from '@/app/api/projects/[projectId]/test-cases/[testCaseId]/versions/route';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  testCase: {
    findUnique: jest.fn(),
  },
}));

describe('GET /api/projects/[projectId]/test-cases/[testCaseId]/versions', () => {
  it('should return versions for a test case', async () => {
    const mockTestCase = {
      id: 'test-case-1',
      version: 3,
    };

    (prisma.testCase.findUnique as jest.Mock).mockResolvedValue(mockTestCase);

    const req = new NextRequest('http://localhost:3000/api/projects/project-1/test-cases/test-case-1/versions');
    const params = { projectId: 'project-1', testCaseId: 'test-case-1' };

    const response = await GET(req, { params });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should return 404 if test case is not found', async () => {
    (prisma.testCase.findUnique as jest.Mock).mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3000/api/projects/project-1/test-cases/non-existent/versions');
    const params = { projectId: 'project-1', testCaseId: 'non-existent' };

    const response = await GET(req, { params });
    const result = await response.json();

    expect(response.status).toBe(404);
    expect(result).toEqual({ error: 'Test case not found' });
  });
});