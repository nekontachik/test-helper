import { prisma } from '@/lib/prisma';

export class OwnershipService {
  static async isProjectOwner(userId: string, projectId: string): Promise<boolean> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    });
    return project?.userId === userId;
  }

  static async isTestCaseOwner(userId: string, testCaseId: string): Promise<boolean> {
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
      select: { 
        userId: true,
        project: {
          select: { userId: true }
        }
      },
    });
    return testCase?.userId === userId || testCase?.project.userId === userId;
  }

  static async isTestRunOwner(userId: string, testRunId: string): Promise<boolean> {
    const testRun = await prisma.testRun.findUnique({
      where: { id: testRunId },
      select: { 
        userId: true,
        project: {
          select: { userId: true }
        }
      },
    });
    return testRun?.userId === userId || testRun?.project.userId === userId;
  }

  static async isTeamMember(userId: string, projectId: string): Promise<boolean> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        user: true,
        testCases: {
          where: { userId },
          take: 1,
        },
        testRuns: {
          where: { userId },
          take: 1,
        },
      },
    });

    if (!project) {
      return false;
    }

    return (
      project.userId === userId ||
      (project.testCases?.length ?? 0) > 0 ||
      (project.testRuns?.length ?? 0) > 0
    );
  }
} 