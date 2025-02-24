import type { TestCase, TestCaseVersion } from '@prisma/client';
import { testCaseFactory } from '../factories/testCaseFactory';

export const testHelpers = {
  createMockTestCase(overrides: Partial<TestCase> = {}): TestCase {
    return testCaseFactory.createTestCase(overrides);
  },

  createMockVersion(
    testCase: TestCase,
    versionNumber: number,
    _changes: string // Prefix with _ to mark as intentionally unused
  ): TestCaseVersion {
    return {
      id: `version-${versionNumber}`,
      testCaseId: testCase.id,
      versionNumber,
      changes: 'Updated test case',
      data: JSON.stringify(testCase),
      userId: testCase.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  },

  mockPrismaSuccess() {
    return {
      $transaction: jest.fn((callback) => callback(this)),
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
    };
  },
}; 