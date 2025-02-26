import type { PrismaClient, Prisma, TestCaseVersion } from '@prisma/client';
import { ErrorFactory } from '@/lib/errors/BaseError';
import type { TestCase } from '@/types';

interface VersionData {
  testCaseId: string;
  data: TestCase;
  authorId: string;
  changes: string;
  versionNumber: number;
}

interface VersionWithUser extends TestCaseVersion {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export class VersionService {
  static async createVersion(tx: PrismaClient, params: VersionData): Promise<VersionWithUser> {
    return tx.testCaseVersion.create({
      data: {
        testCase: { connect: { id: params.testCaseId } },
        user: { connect: { id: params.authorId } },
        data: JSON.stringify(params.data),
        changes: params.changes,
        versionNumber: params.versionNumber,
      } as Prisma.TestCaseVersionCreateInput,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  static async getVersions(tx: PrismaClient, testCaseId: string): Promise<VersionWithUser[]> {
    return tx.testCaseVersion.findMany({
      where: { testCaseId },
      orderBy: { versionNumber: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  static async getVersion(tx: PrismaClient, testCaseId: string, versionNumber: number): Promise<VersionWithUser> {
    const version = await tx.testCaseVersion.findFirst({
      where: { testCaseId, versionNumber },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!version) {
      throw ErrorFactory.create('NOT_FOUND', 'Version not found');
    }

    return version;
  }

  static async getLatestVersion(tx: PrismaClient, testCaseId: string): Promise<VersionWithUser | null> {
    return tx.testCaseVersion.findFirst({
      where: { testCaseId },
      orderBy: { versionNumber: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }
} 