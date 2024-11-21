import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';
import { TestRunStatus } from '@/types';
import type { TestRun, TestCase, TestCaseResult, Prisma } from '@prisma/client';

// Define the exact shape of the data we're getting from Prisma
interface TestRunWithRelations {
  id: string;
  name: string;
  status: string;
  projectId: string;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  testRunCases: Array<{
    id: string;
    testRunId: string;
    testCaseId: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    testCase: {
      id: string;
      title: string;
    };
  }>;
  results: Array<{
    id: string;
    status: string;
    notes: string | null;
    testCaseId: string;
    testRunId: string;
    createdAt: Date;
    updatedAt: Date;
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
        status: TestRunStatus.COMPLETED,
      },
      include: {
        testRunCases: {
          include: {
            testCase: {
              select: {
                id: true,
                title: true,
              }
            }
          }
        },
        results: {
          include: {
            testCase: {
              select: {
                id: true,
                title: true,
              }
            }
          }
        }
      }
    }) as TestRunWithRelations[];

    // Performance optimization: Use Map for O(1) lookups
    const reports = testRuns.map((run) => {
      const resultStatusMap = new Map<string, number>();
      
      run.results.forEach(result => {
        const currentCount = resultStatusMap.get(result.status) || 0;
        resultStatusMap.set(result.status, currentCount + 1);
      });

      return {
        id: run.id,
        name: run.name,
        executedAt: run.completedAt,
        totalTests: run.testRunCases.length,
        passedTests: resultStatusMap.get('PASSED') || 0,
        failedTests: resultStatusMap.get('FAILED') || 0,
        skippedTests: resultStatusMap.get('SKIPPED') || 0,
        results: run.results.map(result => ({
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
  allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EDITOR]
});
