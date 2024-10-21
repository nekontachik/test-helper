import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import { GET, POST } from './route';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  testCase: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
}));

describe('Test Cases API', () => {
  function mockRequestResponse(method: 'GET' | 'POST' = 'GET') {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method,
      query: { projectId: '1' },
    });
    return { req, res };
  }

  it('should return test cases for GET request', async () => {
    const { req, res } = mockRequestResponse('GET');

    const mockTestCases = [{ id: '1', title: 'Test Case 1' }];
    (prisma.testCase.findMany as jest.Mock).mockResolvedValue(mockTestCases);
    (prisma.testCase.count as jest.Mock).mockResolvedValue(1);

    await GET(req as any, { params: { projectId: '1' } });

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      data: mockTestCases,
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  });

  // Add more test cases as needed
});
