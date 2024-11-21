import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';
import { TestRunStatus, TestCaseResultStatus } from '@/types';

async function handler(
  req: Request,
  { params }: { params: { projectId: string; testRunId: string } }
) {
  if (req.method !== 'POST') {
    return NextResponse.json(
      { message: 'Method not allowed' },
      { status: 405 }
    );
  }

  const { projectId, testRunId } = params;

  try {
    const data = await req.json();
    const { results } = data;

    // Validate results
    if (!Array.isArray(results)) {
      return NextResponse.json(
        { message: 'Invalid results format' },
        { status: 400 }
      );
    }

    // Start a transaction
    const updatedTestRun = await prisma.$transaction(async (tx) => {
      // Create test case results
      await Promise.all(
        results.map((result) =>
          tx.testCaseResult.create({
            data: {
              testCaseId: result.testCaseId,
              testRunId,
              status: result.status as TestCaseResultStatus,
              notes: result.notes,
            },
          })
        )
      );

      // Update test run status
      return tx.testRun.update({
        where: { id: testRunId },
        data: {
          status: TestRunStatus.COMPLETED,
          completedAt: new Date(),
        },
        include: {
          testRunCases: {
            include: {
              testCase: true
            }
          },
          results: true,
        },
      });
    });

    return NextResponse.json(updatedTestRun);
  } catch (error) {
    console.error('Error executing test run:', error);
    return NextResponse.json(
      { message: 'Failed to execute test run' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler, {
  allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EDITOR]
});
