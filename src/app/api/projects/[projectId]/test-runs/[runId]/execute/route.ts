import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { dbLogger } from '@/lib/logger';
import { testResultSchema } from '@/lib/validations/testResult';
import { TestCaseResultStatus } from '@/types';
import { z } from 'zod';

const executeTestSchema = z.object({
  testCaseId: z.string(),
  status: z.nativeEnum(TestCaseResultStatus),
  notes: z.string().optional(),
  evidenceUrls: z.array(z.string()).optional()
});

type ExecuteTestInput = z.infer<typeof executeTestSchema>;

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
    const validatedData = executeTestSchema.parse(body) as ExecuteTestInput;

    const testRun = await prisma.testRun.findUnique({
      where: { 
        id: params.runId,
        projectId: params.projectId
      },
      include: {
        testRunCases: true
      }
    });

    if (!testRun) {
      throw new AppError('Test run not found', 404);
    }

    // Create test result
    const result = await prisma.testCaseResult.create({
      data: {
        testCaseId: validatedData.testCaseId,
        testRunId: params.runId,
        status: validatedData.status,
        notes: validatedData.notes ?? '',
        userId: session.user.id
      }
    });

    // Check if this was the last test case
    const completedCases = await prisma.testCaseResult.count({
      where: { testRunId: params.runId }
    });

    // Update test run status if all cases are completed
    if (completedCases === testRun.testRunCases.length) {
      await prisma.testRun.update({
        where: { id: params.runId },
        data: { 
          status: 'completed',
          completedAt: new Date()
        }
      });
    }

    dbLogger.info('Test case result recorded', {
      testRunId: params.runId,
      testCaseId: validatedData.testCaseId,
      status: validatedData.status
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
