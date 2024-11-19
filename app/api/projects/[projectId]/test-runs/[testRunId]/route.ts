import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { TestRunStatus, TestCaseResultStatus } from '@/types';
import { AppError, NotFoundError } from '@/lib/errors';
import logger from '@/lib/logger';

export async function PUT(
  request: Request,
  { params }: { params: { projectId: string; testRunId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { projectId, testRunId } = params;
    const { status, testCaseResults } = await request.json();

    const updatedTestRun = await prisma.testRun.update({
      where: { id: testRunId },
      data: {
        status: status as TestRunStatus,
        testRunCases: {
          create: testCaseResults.map((result: any) => ({
            status: result.status as TestCaseResultStatus,
            notes: result.notes,
            testCase: { connect: { id: result.testCaseId } },
          })),
        },
      },
      include: {
        testRunCases: true,
      },
    });

    return NextResponse.json(updatedTestRun);
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(`AppError in PUT test run: ${error.message}`);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Error updating test run:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
