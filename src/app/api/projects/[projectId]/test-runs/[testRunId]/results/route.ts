import { NextRequest, NextResponse } from 'next/server';
import {prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { AppError, NotFoundError } from '@/lib/errors';
import logger from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; testRunId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const { projectId, testRunId } = params;

    const testCaseResults = await prisma.testCaseResult.findMany({
      where: { testRunId },
      include: { testCase: true },
    });

    if (!testCaseResults.length) {
      throw new NotFoundError('No test case results found for this test run');
    }

    logger.info(`Retrieved test case results for test run: ${testRunId}`, { projectId, testRunId });
    return NextResponse.json(testCaseResults);
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(`AppError in GET test case results: ${error.message}`, { statusCode: error.statusCode });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unexpected error in GET test case results:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string; testRunId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const { projectId, testRunId } = params;
    const body = await request.json();

    if (!Array.isArray(body.results)) {
      throw new AppError('Invalid request body', 400);
    }

    const createdResults = await prisma.testCaseResult.createMany({
      data: body.results.map((result: any) => ({
        ...result,
        testRunId,
      })),
    });

    logger.info(`Created test case results for test run: ${testRunId}`, { projectId, testRunId, count: createdResults.count });
    return NextResponse.json({ success: true, count: createdResults.count }, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(`AppError in POST test case results: ${error.message}`, { statusCode: error.statusCode });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unexpected error in POST test case results:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
