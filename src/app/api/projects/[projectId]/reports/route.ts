import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';
import { TestCaseResultStatus } from '@/types';
import { Prisma } from '@prisma/client';

interface TestRunResult {
  id: string;
  name: string;
  status: string;
  projectId: string;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  testCases: Array<{
    id: string;
    title: string;
  }>;
  testCaseResults: Array<{
    id: string;
    status: TestCaseResultStatus;
    notes: string | null;
    testCaseId: string;
    testCase: {
      id: string;
      title: string;
    };
  }>;
}

async function handler(req: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;

  if (req.method === 'GET') {
    const testRuns = await prisma.testRun.findMany({
      where: { 
        projectId,
        status: 'COMPLETED',
      },
      select: {
        id: true,
        name: true,
        status: true,
        projectId: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
        testCases: {
          select: {
            id: true,
            title: true,
          },
        },
        testCaseResults: {
          select: {
            id: true,
            status: true,
            notes: true,
            testCaseId: true,
            testCase: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    }) as unknown as TestRunResult[];

    // Performance optimization: Use Map for O(1) lookups
    const reports = testRuns.map((run: TestRunResult) => {
      const resultStatusMap = new Map<TestCaseResultStatus, number>();
      
      run.testCaseResults.forEach(result => {
        const currentCount = resultStatusMap.get(result.status) || 0;
        resultStatusMap.set(result.status, currentCount + 1);
      });

      return {
        id: run.id,
        name: run.name,
        executedAt: run.completedAt,
        totalTests: run.testCases.length,
        passedTests: resultStatusMap.get(TestCaseResultStatus.PASSED) || 0,
        failedTests: resultStatusMap.get(TestCaseResultStatus.FAILED) || 0,
        skippedTests: resultStatusMap.get(TestCaseResultStatus.SKIPPED) || 0,
        results: run.testCaseResults.map(result => ({
          testCase: result.testCase,
          status: result.status,
          notes: result.notes,
        })),
      };
    });

    return NextResponse.json(reports);
  }

  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}

export const GET = withAuth(handler, {
  allowedRoles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TESTER]
});
