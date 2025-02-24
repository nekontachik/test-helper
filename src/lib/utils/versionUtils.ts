import type { PrismaClient, TestCaseVersion } from '@prisma/client';
import type { TestCaseInput } from '@/lib/validators/testCaseValidator';
import { validateTestCase } from '@/lib/validators/testCaseValidator';
import type { Prisma } from '@prisma/client';

interface CreateVersionParams {
  testCaseId: string;
  versionNumber: number;
  changes: string;
  data: TestCaseInput;
  authorId: string;
}

export const versionUtils = {
  async createVersion(
    tx: Prisma.TransactionClient,
    params: CreateVersionParams
  ): Promise<TestCaseVersion> {
    return tx.testCaseVersion.create({
      data: {
        testCaseId: params.testCaseId,
        versionNumber: params.versionNumber,
        changes: params.changes,
        data: JSON.stringify(params.data),
        userId: params.authorId
      }
    });
  },

  async getLatestVersion(
    tx: PrismaClient,
    testCaseId: string
  ): Promise<TestCaseVersion | null> {
    return tx.testCaseVersion.findFirst({
      where: { testCaseId },
      orderBy: { versionNumber: 'desc' },
    });
  },

  parseVersionData(version: { data: string }): TestCaseInput {
    const data = JSON.parse(version.data) as unknown;
    return validateTestCase(data);
  }
}; 