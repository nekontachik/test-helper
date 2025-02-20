import type { TestCaseData, TestCaseWithVersion } from '../testCaseService';
import { 
  createTestCase,
  updateTestCase,
  getTestCaseVersions,
  bulkCreateTestCases,
  restoreTestCaseVersion,
} from '../testCaseService';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import type { TestCaseStatus, TestCasePriority } from '@/types';
import type { PrismaClient } from '@prisma/client';

// Add TestCaseVersion to mock Prisma client
type MockPrismaClient = PrismaClient & {
  testCaseVersion: {
    create: jest.Mock;
    findMany: jest.Mock;
    findFirst: jest.Mock;
    update?: jest.Mock;
    delete?: jest.Mock;
  };
  $transaction: jest.Mock;
};

jest.mock('next-auth');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    testCase: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    testCaseVersion: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  } as unknown as MockPrismaClient,
}));

describe('testCaseService', () => {
  const mockUser = { id: 'user-1', email: 'test@example.com' };
  const mockSession = { user: mockUser };
  const mockTestCase: TestCaseWithVersion = {
    id: 'test-1',
    title: 'Test Case 1',
    description: 'Description',
    steps: ['Step 1', 'Step 2'],
    expectedResult: 'Expected result',
    status: 'ACTIVE' as TestCaseStatus,
    priority: 'HIGH' as TestCasePriority,
    projectId: 'project-1',
    userId: mockUser.id,
    currentVersion: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('createTestCase', () => {
    it('should create test case with initial version', async () => {
      const testCaseData: TestCaseData = {
        title: 'Test Case 1',
        steps: ['Step 1', 'Step 2'],
        expectedResult: 'Expected result',
        status: 'ACTIVE' as TestCaseStatus,
        priority: 'HIGH' as TestCasePriority,
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(prisma);
      });

      (prisma.testCase.create as jest.Mock).mockResolvedValue(mockTestCase);
      (prisma.testCaseVersion.create as jest.Mock).mockResolvedValue({
        id: 'version-1',
        testCaseId: 'test-1',
        versionNumber: 1,
      });

      const result = await createTestCase('project-1', testCaseData);
      expect(result).toEqual(mockTestCase);
      expect(prisma.testCaseVersion.create).toHaveBeenCalled();
    });
  });

  describe('updateTestCase', () => {
    it('should update test case and create new version', async () => {
      const updateData = {
        title: 'Updated Title',
        steps: ['Updated Step 1'],
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(prisma);
      });

      (prisma.testCase.findUnique as jest.Mock).mockResolvedValue({
        ...mockTestCase,
        versions: [{ versionNumber: 1 }],
      });

      (prisma.testCase.update as jest.Mock).mockResolvedValue({
        ...mockTestCase,
        ...updateData,
        currentVersion: 2,
      });

      const result = await updateTestCase('test-1', updateData, 'Updated title and steps');
      expect(result.title).toBe('Updated Title');
      expect(result.currentVersion).toBe(2);
    });
  });

  describe('getTestCaseVersions', () => {
    it('should return version history', async () => {
      const mockVersions = [
        {
          versionNumber: 2,
          changes: 'Updated title',
          data: JSON.stringify({ title: 'Updated Title' }),
          user: mockUser,
        },
        {
          versionNumber: 1,
          changes: 'Initial version',
          data: JSON.stringify(mockTestCase),
          user: mockUser,
        },
      ];

      (prisma.testCaseVersion.findMany as jest.Mock).mockResolvedValue(mockVersions);

      const result = await getTestCaseVersions('test-1');
      expect(result).toHaveLength(2);
      expect(result[0].versionNumber).toBe(2);
      expect(result[1].versionNumber).toBe(1);
    });
  });

  describe('bulkCreateTestCases', () => {
    it('should create multiple test cases with versions', async () => {
      const testCases: TestCaseData[] = [
        {
          title: 'Test Case 1',
          steps: ['Step 1'],
          expectedResult: 'Result 1',
          status: 'ACTIVE' as TestCaseStatus,
          priority: 'HIGH' as TestCasePriority,
        },
        {
          title: 'Test Case 2',
          steps: ['Step 1'],
          expectedResult: 'Result 2',
          status: 'ACTIVE' as TestCaseStatus,
          priority: 'MEDIUM' as TestCasePriority,
        },
      ];

      (prisma.testCase.create as jest.Mock).mockResolvedValue(mockTestCase);
      (prisma.testCaseVersion.create as jest.Mock).mockResolvedValue({
        id: 'version-1',
        versionNumber: 1,
      });

      const result = await bulkCreateTestCases('project-1', testCases);
      expect(result).toHaveLength(2);
      expect(prisma.testCase.create).toHaveBeenCalledTimes(2);
      expect(prisma.testCaseVersion.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('restoreTestCaseVersion', () => {
    it('should restore test case to previous version', async () => {
      const oldVersion = {
        id: 'version-1',
        versionNumber: 1,
        data: JSON.stringify({
          title: 'Old Title',
          steps: ['Old Step'],
          expectedResult: 'Expected result',
          status: 'ACTIVE' as TestCaseStatus,
          priority: 'HIGH' as TestCasePriority,
        }),
        userId: 'user-1',
        testCaseId: 'test-1',
        changes: 'Initial version',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.testCaseVersion.findFirst as jest.Mock).mockResolvedValue(oldVersion);
      (prisma.testCase.update as jest.Mock).mockResolvedValue({
        ...mockTestCase,
        title: 'Old Title',
        steps: ['Old Step'],
        currentVersion: 2,
      });

      const result = await restoreTestCaseVersion('test-1', 1);
      expect(result.title).toBe('Old Title');
      expect(result.currentVersion).toBe(2);
    });

    it('should handle transaction failures', async () => {
      (prisma.$transaction as jest.Mock).mockRejectedValue(new Error('Transaction failed'));
      await expect(restoreTestCaseVersion('test-1', 1))
        .rejects.toThrow('Failed to restore version');
    });

    it('should validate version number', async () => {
      await expect(restoreTestCaseVersion('test-1', -1))
        .rejects.toThrow('Invalid version number');
    });
  });
}); 