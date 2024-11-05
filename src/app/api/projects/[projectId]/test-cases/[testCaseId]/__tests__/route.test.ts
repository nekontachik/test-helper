import { testCase } from '@/test/fixtures';
import { prisma } from '@/lib/prisma';
import { GET, PUT, DELETE } from '../route';
import { NextRequest } from 'next/server';

describe('Test Case API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns test case by ID', async () => {
      const request = new NextRequest('http://localhost/api/test-cases/123');
      const response = await GET(request, { params: { testCaseId: '123' } });
      expect(response.status).toBe(200);
    });
  });
});
