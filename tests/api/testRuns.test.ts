import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/projects/[projectId]/test-runs/route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  testRun: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}));

describe('Test Runs API', () => {
  it('should return test runs', async () => {
    const mockTestRuns = [{ id: '1', name: 'Test Run 1', status: 'PLANNED' }];
    (prisma.testRun.findMany as jest.Mock).mockResolvedValue(mockTestRuns);

    const url = new URL('http://localhost:3000/api/projects/1/test-runs');
    const request = new NextRequest(url);
    const handler = await GET;
    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockTestRuns);
    expect(prisma.testRun.findMany).toHaveBeenCalledWith({
      where: { projectId: '1' },
    });
  });

  // Add more tests as needed
});
