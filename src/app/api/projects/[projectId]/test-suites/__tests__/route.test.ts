import { testSuite } from '@/test/fixtures';
import { prisma } from '@/lib/prisma';
import { GET, POST } from '../route';
import { NextRequest } from 'next/server';

describe('Test Suite API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns test suites for project', async () => {
      const request = new NextRequest('http://localhost/api/projects/123/test-suites');
      const response = await GET(request, { params: { projectId: '123' } });
      expect(response.status).toBe(200);
    });
  });
});
