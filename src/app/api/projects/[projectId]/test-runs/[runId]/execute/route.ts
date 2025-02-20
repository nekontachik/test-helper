import { NextResponse } from 'next/server';
import { withSimpleAuth } from '@/lib/auth/withSimpleAuth';
import { prisma } from '@/lib/prisma';
import { TestRunStatus, TestResultStatus } from '@/types/testRun';
import { logger } from '@/lib/utils/logger';

async function handler(
  req: Request,
  { params }: { params: { projectId: string; runId: string } }
) {
  const { projectId, runId } = params;

  try {
    const data = await req.json();
    const { results } = data;

    // Start transaction
    const [updatedRun, ...createdResults] = await prisma.$transaction(async (tx) => {
      // Update test run status
      const run = await tx.testRun.update({
        where: { id: runId },
        data: {
          status: TestRunStatus.IN_PROGRESS,
          startedAt: new Date(),
        },
      });

      // Create test results
      const resultPromises = results.map((result: any) =>
        tx.testResult.create({
          data: {
            testCaseId: result.testCaseId,
            runId,
            status: result.status as TestResultStatus,
            notes: result.notes,
            startedAt: new Date(),
            completedAt: result.status !== TestResultStatus.BLOCKED ? new Date() : null,
            executedById: (req as any).user?.id, // From withSimpleAuth
          },
        })
      );

      const createdResults = await Promise.all(resultPromises);

      return [run, ...createdResults];
    });

    logger.info({
      runId,
      resultsCount: createdResults.length,
    }, 'Test run execution started');

    return NextResponse.json({
      run: updatedRun,
      results: createdResults,
    });

  } catch (error) {
    logger.error('Error executing test run:', error);
    return NextResponse.json(
      { error: 'Failed to execute test run' },
      { status: 500 }
    );
  }
}

export const POST = withSimpleAuth(handler);
