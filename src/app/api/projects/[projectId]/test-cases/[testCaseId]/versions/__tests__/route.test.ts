import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { UserRole } from '@/types/auth';
import { TestCaseStatus, TestCasePriority } from '@/types';

jest.mock('@/lib/prisma', () => ({
  testCase: {
    update: jest.fn(),
  },
  testCaseVersion: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
  },
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

describe('Test Case Versions API', () => {
  const mockUser = {
    id: '1',
    role: UserRole.PROJECT_MANAGER,
  };

  const mockVersion = {
    id: '1',
    testCaseId: 'test-1',
    versionNumber: 1,
    title: 'Test Case 1',
    description: 'Description',
    steps: 'Step 1\nStep 2',
    expectedResult: 'Expected result',
    status: TestCaseStatus.ACTIVE,
    priority: TestCasePriority.HIGH,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return test case versions when authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.version.findMany as jest.Mock).mockResolvedValue([mockVersion]);

      const url = new URL('http://localhost:3000/api/projects/1/test-cases/test-1/versions');
      const request = new NextRequest(url);
      const handler = await GET;
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([mockVersion]);
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const url = new URL('http://localhost:3000/api/projects/1/test-cases/test-1/versions');
      const request = new NextRequest(url);
      const handler = await GET;
      const response = await handler(request);

      expect(response.status).toBe(401);
    });
  });

  describe('POST', () => {
    it('should restore version when authenticated as PROJECT_MANAGER', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.version.findFirst as jest.Mock).mockResolvedValue(mockVersion);
      (prisma.testCase.update as jest.Mock).mockResolvedValue({ ...mockVersion, id: 'test-1' });

      const url = new URL('http://localhost:3000/api/projects/1/test-cases/test-1/versions');
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify({ versionNumber: 1 }),
      });
      const handler = await POST;
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Version restored successfully');
    });

    it('should return 404 when version not found', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.version.findFirst as jest.Mock).mockResolvedValue(null);

      const url = new URL('http://localhost:3000/api/projects/1/test-cases/test-1/versions');
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify({ versionNumber: 999 }),
      });
      const handler = await POST;
      const response = await handler(request);

      expect(response.status).toBe(404);
    });
  });
});
