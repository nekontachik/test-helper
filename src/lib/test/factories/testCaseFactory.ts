import type { TestCase, TestCaseVersion } from '@prisma/client';
import type { TestCaseStatus, TestCasePriority } from '@/types';
import { faker } from '@faker-js/faker';

export const testCaseFactory = {
  createTestCase(overrides: Partial<TestCase> = {}): TestCase {
    return {
      id: faker.string.uuid(),
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      steps: faker.lorem.paragraph(),
      expectedResult: faker.lorem.paragraph(),
      status: 'ACTIVE' as TestCaseStatus,
      priority: 'MEDIUM' as TestCasePriority,
      projectId: faker.string.uuid(),
      userId: faker.string.uuid(),
      currentVersion: 1,
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  },

  createTestCaseVersion(testCase: TestCase, versionNumber: number): TestCaseVersion {
    return {
      id: faker.string.uuid(),
      testCaseId: testCase.id,
      versionNumber,
      changes: 'Updated test case',
      data: JSON.stringify(testCase),
      userId: testCase.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}; 