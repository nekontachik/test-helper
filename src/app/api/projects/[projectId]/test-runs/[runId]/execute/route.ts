import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { dbLogger } from '@/lib/logger';
import { executeTestSchema } from '@/lib/validations/testResult';
import type { Prisma } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string; runId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new AppError('Unauthorized', 401);
    }

    const body = await request.json();
    const validatedData = executeTestSchema.parse(body);

    // Start transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Check if test run exists and is active
      const testRun = await tx.testRun.findUnique({
        where: { 
          id: params.runId,
          projectId: params.projectId,
          status: 'IN_PROGRESS'
        },
        include: {
          testRunCases: true
        }
      });

      if (!testRun) {
        throw new AppError('Test run not found or not active', 404);
      }

      // Create test result with type-safe data
      const testResultData: Prisma.TestCaseResultCreateInput = {
        testCase: { connect: { id: validatedData.testCaseId } },
        testRun: { connect: { id: params.runId } },
        status: validatedData.status,
        notes: validatedData.notes,
        user: { connect: { id: session.user.id } },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const testResult = await tx.testCaseResult.create({
        data: testResultData
      });

      // Check if this was the last test case
      const completedResults = await tx.testCaseResult.count({
        where: { testRunId: params.runId }
      });

      // Update test run status if all cases are completed
      if (completedResults === testRun.testRunCases.length) {
        await tx.testRun.update({
          where: { id: params.runId },
          data: { 
            status: 'COMPLETED',
            completedAt: new Date()
          }
        });
      }

      return testResult;
    });

    dbLogger.info('Test case result recorded', {
      testRunId: params.runId,
      testCaseId: validatedData.testCaseId,
      status: validatedData.status,
      userId: session.user.id
    });

    return NextResponse.json(result);
  } catch (error) {
    dbLogger.error('Error executing test case:', error);
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
